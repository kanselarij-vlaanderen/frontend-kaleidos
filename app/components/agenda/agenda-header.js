// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  alias, filter
} from '@ember/object/computed';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import { all } from 'rsvp';
import {
  setAgendaitemFormallyOk
} from 'frontend-kaleidos/utils/agendaitem-utils';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
} from 'frontend-kaleidos/utils/zip-agenda-files';
import moment from 'moment';
import { task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: service(),
  // These 2 can be very confusing, session-service is for meetings, current-session is for checking admin etc.
  sessionService: service('session-service'),
  currentSessionService: service('current-session'),
  agendaService: service(),
  fileService: service(),
  router: service(),
  intl: service(),
  jobMonitor: service(),
  toaster: service(),

  isAddingAgendaitems: false,
  onRefreshNeeded: null, // argument. Function to execute after creating an agenda-item.
  isApprovingAllAgendaitems: false,
  showLoadingOverlay: false,
  loadingOverlayMessage: null,
  showConfirmForApprovingAgenda: false,
  showConfirmForApprovingAgendaAndClosingMeeting: false,
  showConfirmForClosingMeeting: false,
  showConfirmForDeletingSelectedAgenda: false,
  showConfirmForReopeningPreviousAgenda: false,
  piecesToDeleteReopenPreviousAgenda: null,

  currentAgendaitems: alias('sessionService.currentAgendaitems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'), // This list is reverse sorted on serialnumber

  /**
   * @computed isSessionClosable
   *
   * The session is closable when there are more than 1 agendas OR when there is only 1 agenda that is not a design agenda
   * @return {boolean}
   */
  isSessionClosable: computed('agendas.[]', async function() {
    const agendas = await this.get('agendas');
    if (agendas && agendas.length > 1) {
      return true;
    }
    const onlyAgenda = await agendas.get('firstObject');
    if (onlyAgenda.get('isDesignAgenda')) {
      return false;
    }
    return true;
  }),

  /**
   * @computed lastApprovedAgenda
   *
   * From all agendas, get the last agenda that is not a design agenda
   */
  lastApprovedAgenda: computed('agendas.[]', async function() {
    const agendas = await this.get('agendas');
    // this.agendas are already sorted on reverse serialNumbers
    const lastApprovedAgenda = agendas
      .filter((agenda) => !agenda.get('isDesignAgenda'))
      .get('firstObject');
    return lastApprovedAgenda;
  }),

  /**
   * @computed lastApprovedAgendaName
   *
   * From all agendas, get the last agenda that is not a design agenda and return the name
   * For some bizarre reason, doing lastApprovedAgenda.agendaName in template gives nothing, but this works...
   * @return {String}
   */
  lastApprovedAgendaName: computed('lastApprovedAgenda', async function() {
    const lastApprovedAgenda = await this.get('lastApprovedAgenda');
    return lastApprovedAgenda.agendaName;
  }),

  currentAgendaIsLast: computed('currentAgenda', 'currentSession.{agendas.[],sortedAgendas.firstObject.id}', async function() {
    return (await this.get('currentSession.sortedAgendas.firstObject.id')) === (await this.currentAgenda.get('id'));
  }),

  designAgendaPresent: filter('currentSession.agendas.@each.isDesignAgenda', (agenda) => agenda.get('isDesignAgenda')),

  /**
   * canReopenPreviousAgenda
   * - the meeting must not be final
   * - the meeting to have at least one approved agenda (isSessionClosable)
   * - the user must be admin
   * - the current selected agenda must be the last one
   * - the current selected agenda should be design agenda
   * TODO check if kanselarij should be able to use this
   * TODO check if we want to be able to reopen an approved agenda without a design agenda present
   * @returns boolean
   */
  canReopenPreviousAgenda: computed('currentAgenda.isDesignAgenda', 'currentAgendaIsLast', 'currentSession.isFinal', 'currentSessionService.isAdmin', 'isSessionClosable', async function() {
    const isSessionClosable = await this.isSessionClosable;
    const isAdminAndLastAgenda = this.currentSessionService.isAdmin && (await this.currentAgendaIsLast); // TODO why are these together ?

    if (!this.currentSession.isFinal && isSessionClosable && this.currentAgenda.isDesignAgenda && isAdminAndLastAgenda) {
      return true;
    }
    return false;
  }),

  /**
   * canDeleteSelectedAgenda
   * - if the currentAgenda is design agenda, both editor and admin can delete
   * - if the currentAgenda is approved, only admin can delete the agenda if it's the latest one
   * @returns boolean
   */
  canDeleteSelectedAgenda: computed('currentAgenda.isDesignAgenda', 'currentAgendaIsLast', 'currentSessionService.isAdmin', async function() {
    const isAdminAndLastAgenda = this.currentSessionService.isAdmin && (await this.currentAgendaIsLast); // TODO why are these together ?
    if (this.currentAgenda.isDesignAgenda || isAdminAndLastAgenda) {
      return true;
    }
    return false;
  }),

  /**
   * reloadAgendaitemsOfAgendaActivities
   * After a new designagenda is created or an agenda deleted in the service we need to update the agenda activities
   * The store only updates the agendaitems of agenda-activities if we do it outselves
   */
  async reloadAgendaitemsOfAgendaActivities(agendaitems) {
    await agendaitems.map(async(agendaitem) => {
      const agendaActivity = await agendaitem.get('agendaActivity');
      if (agendaActivity) {
        await agendaActivity.hasMany('agendaitems').reload();
      }
    });
  },

  /**
   * @method CreateDesignAgenda
   *
   * Get the last approved agenda and change the status to approves (from final)
   * Then approve that agenda using the agenda-approve service which yields a new design agenda
   */
  async createDesignAgenda() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-add-message'));
    const currentMeeting = this.currentSession;
    const newAgenda = await this.agendaService.createNewDesignAgenda(currentMeeting);
    // After the agenda has been created, we want to update the agendaitems of activities
    const agendaitems = await newAgenda.get('agendaitems');
    await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
    this.toggleLoadingOverlayWithMessage(null);
    return this.router.transitionTo('agenda.agendaitems', currentMeeting.id, newAgenda.id);
  },

  /**
   * toggleLoadingOverlayWithMessage
   * This method will toggle the AUOverlay modal component with a custom message
   * message = null will instead show a default message in the loader, and clear the local state of the message
   * @param {String} message: the message to show. If given, the text " even geduld aub..." will always be appended
   */
  toggleLoadingOverlayWithMessage(message) {
    if (message) {
      this.set('loadingOverlayMessage', `${message} ${this.intl.t('please-be-patient')}`);
    } else {
      this.set('loadingOverlayMessage', null);
    }
    this.loading(); // hides the agenda overview/sidebar
    this.toggleProperty('showLoadingOverlay'); // blocks the use of buttons
  },

  /**
   * approveCurrentAgenda
   *
   * This method is going to send the current design agenda to the agenda service for approval
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems on that agenda have to be resorted (do this in service ?)
   * - For items that have been on previous approved agendas (and not formally ok now), we have to move the changes made to the new agenda
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * This should best be done in the approve service, because we want all triples copied.
   * Since the changes happen in a mirco-service, we have to update our local store by reloading
   *
   */
  async approveCurrentAgenda() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-approving-text'));
    const currentMeeting = this.currentSession;
    const currentDesignAgenda = this.currentAgenda;
    // TODO KAS-2452 what if this times out ? some reloads may not happen (put them in route ?)
    const newAgenda = await this.agendaService.approveDesignAgenda(currentMeeting, currentDesignAgenda);
    // Data reloading
    // currentAgenda does not get reloaded on route change, we do it manually
    await currentDesignAgenda.reload();
    await currentDesignAgenda.belongsTo('status').reload();
    // amount of agendaitems of agendaActivity are not reloaded on route change, we do it manually
    const agendaitems = await currentDesignAgenda.hasMany('agendaitems').reload();
    await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
    this.toggleLoadingOverlayWithMessage(null);
    return this.router.transitionTo('agenda.agendaitems', currentMeeting.id, newAgenda.id);
  },

  /**
   * approveCurrentAgendaAndCloseMeeting
   *
   * This method is going to change the status of the current design agenda to closed
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems have to be resorted
   * - For items that have been on previous approved agendas (and not formally ok now), we have to rollback the agendaitems to a previous version
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * We also set the meeting to closed and set the final agenda
   *
   */
  async approveCurrentAgendaAndCloseMeeting() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-approve-and-close-message'));
    const currentMeeting = this.currentSession;
    const currentDesignAgenda = this.currentAgenda;
    await this.agendaService.approveAgendaAndCloseMeeting(currentMeeting, currentDesignAgenda);
    // Data reloading, we do not change route, refresh not working because of sibling routes?
    // currentAgenda does not get reloaded, we do it manually
    await currentDesignAgenda.reload(); // need changed attributes (modified)
    await currentDesignAgenda.belongsTo('status').reload(); // need changed status
    // amount of agendaitems of agendaActivity are not reloaded, we do it manually
    const agendaitems = await currentDesignAgenda.hasMany('agendaitems').reload();
    await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
    // we don't change route, but the model has changes and needs a reload, we do it manually
    await currentMeeting.reload(); // need changed attributes (isFinal)
    await currentMeeting.hasMany('agendas').reload();
    this.toggleLoadingOverlayWithMessage(null);
    // TODO KAS-2452 this refresh doesn't do much ..., reloads are needed
    // this.onRefreshNeeded();
  },

  /**
   * closeMeeting
   *
   * This method will delete the current design agenda (if applicable) and close the meeting
   */
  async closeMeeting() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-close-message'));
    const currentMeeting = this.currentSession;
    const currentAgenda = this.currentAgenda;
    const isDesignAgenda = await currentAgenda.isDesignAgenda;
    const lastApprovedAgenda = await this.agendaService.closeMeeting(currentMeeting);
    // Data reloading
    // lastApprovedAgenda does not get reloaded, we do it manually
    await lastApprovedAgenda.reload(); // need changed attributes (modified)
    await lastApprovedAgenda.belongsTo('status').reload(); // need changed status
    // amount of agendaitems of agendaActivity are not reloaded, we do it manually
    const agendaitems = await lastApprovedAgenda.hasMany('agendaitems').reload();
    await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
    // we don't always change route, but the model has changes and needs a reload, we do it manually
    await currentMeeting.reload(); // need changed attributes (isFinal)
    await currentMeeting.hasMany('agendas').reload();
    this.toggleLoadingOverlayWithMessage(null);
    if (isDesignAgenda) {
      return this.router.transitionTo('agenda.agendaitems', currentMeeting.id, lastApprovedAgenda.get('id'));
    }
    // TODO KAS-2452 this refresh doesn't do much ..., reloads are needed
    // this.onRefreshNeeded();
  },

  /**
   * deleteSelectedAgenda
   *
   * This method will delete the current agenda only if it's the last agenda of the meeting, regardless of status
   * If this is the only agenda in the meeting, also delete the meeting (broken state if there is a meeting with 0 agendas)
   */
  async deleteSelectedAgenda() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-delete-message'));
    if (await this.canDeleteSelectedAgenda) {
      const currentMeeting = this.currentSession;
      const currentAgenda = this.currentAgenda;
      const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(currentMeeting, currentAgenda);
      await this.agendaService.deleteAgenda(currentMeeting, currentAgenda);
      // Data reloading
      if (previousAgenda) {
        // amount of agendaitems of agendaActivity are not reloaded, we do it manually
        const agendaitems = await previousAgenda.hasMany('agendaitems').reload();
        await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
        // the model has changes and needs a reload, we do it manually
        // TODO KAS-2452 route change should work?
        await currentMeeting.reload(); // need changed attributes (isFinal)
        await currentMeeting.hasMany('agendas').reload();
        this.toggleLoadingOverlayWithMessage(null);
        return this.router.transitionTo('agenda.agendaitems', currentMeeting.id, previousAgenda.get('id'));
      }
      // if there is no previous agenda, the meeting should have been deleted
      this.toggleLoadingOverlayWithMessage(null);
      return this.router.transitionTo('agendas');
    }
  },

  /**
   * reopenPreviousAgenda
   *
   * This method will delete the design agenda (if applicable) and change the last approved agenda status to design agenda.
   * This method is only reachable through a strict set of rules: canReopenPreviousAgenda
   *
   */
  async reopenPreviousAgenda() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-reopen-previous-version-message'));
    // if (await this.canReopenPreviousAgenda) { // TODO KAS-2452 should be unreachable without, do we need this? (general question for all actions)
      const currentMeeting = this.currentSession;
      // delete all the new documents from the designagenda
      if (this.piecesToDeleteReopenPreviousAgenda) {
        await all(this.piecesToDeleteReopenPreviousAgenda.map(async(piece) => {
          await this.fileService.deletePiece(piece);
        }));
        this.set('piecesToDeleteReopenPreviousAgenda', null);
      }
      const lastApprovedAgenda = await this.agendaService.reopenPreviousAgenda(currentMeeting);
      // Data reloading
      // lastApprovedAgenda does not get reloaded, we do it manually
      // TODO KAS-2452 test without, route change *should* reload last approved agenda
      await lastApprovedAgenda.reload();
      await lastApprovedAgenda.belongsTo('status').reload();
      // amount of agendaitems of agendaActivity are not reloaded, we do it manually
      const agendaitems = await lastApprovedAgenda.hasMany('agendaitems').reload();
      await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
      // the model has changes and needs a reload, we do it manually
      // TODO KAS-2452 route change should work?
      await currentMeeting.reload();
      await currentMeeting.hasMany('agendas').reload();
      this.toggleLoadingOverlayWithMessage(null);
      return this.router.transitionTo('agenda.agendaitems', currentMeeting.id, lastApprovedAgenda.id);
  },

  /**
   * ensureAgendaDataIsRecent
   *
   * This method will reload the agendaitems of the current agenda
   * Any new agendaitem or changed formallity is picked up by this, preventing the triggering the relevant agenda actions with stale date
   * created by concurrent edits of agendaitem formally ok status by other uses
   *
   */
  async ensureAgendaDataIsRecent() {
    // WARN: This reload will:
    // - Refresh the amount of agendaitems there are (if new were added)
    // - Reload the agendaitems attributes (titles, formal ok status (uri), etc)
    // - Reload the agendaitems concurrency (modified attribute)
    // This reload will NOT:
    // - Reload the relationships of agendaitems
    // Making it possible to save agendaitems with old relationships
    this.toggleLoadingOverlayWithMessage(this.intl.t('agendaitems-loading-text'));
    await this.currentAgenda.hasMany('agendaitems').reload();
    // WARN: When reloading this data, only the agendaitems that are not "formally ok" have to be fully reloaded
    // If not reloaded, any following PATCH call on these agendaitems will succeed (due to the hasMany reload above) but with old relation data
    const agendaitemsNotOk = await this.currentAgenda.get('allAgendaitemsNotOk');
    for (const agendaitem of agendaitemsNotOk) {
      await this.ensureAgendaitemDataIsRecent(agendaitem);
    }
    this.toggleLoadingOverlayWithMessage(null);
  },

  /**
   * ensureAgendaitemDataIsRecent
   *
   * This method will reload the agendaitem and several relations
   * Making it possible to save a new change to an agendaitem without the user refreshing the entire page (like formal ok status)
   *
   */
  async ensureAgendaitemDataIsRecent(agendaitem) {
    await agendaitem.reload();
    await agendaitem.hasMany('pieces').reload();
    await agendaitem.hasMany('treatments').reload();
    await agendaitem.hasMany('mandatees').reload();
    await agendaitem.hasMany('approvals').reload();
    await agendaitem.hasMany('linkedPieces').reload();
  },

  /**
   * loadPiecesToDelete
   *
   * This task will get all pieces that are new on the current designAgenda
   * Excluding the pieces from new agendaitems, they don't have to be deleted
   * Used in reopenPreviousAgenda action
   */
  loadPiecesToDelete: task(function *() {
    const agendaitems = yield this.currentAgenda.get('agendaitems');
    const previousAgenda = yield this.get('lastApprovedAgenda');
    const pieces = [];
    const agendaitemNewPieces = agendaitems.map(async(agendaitem) => {
      const previousVersion = await agendaitem.get('previousVersion');
      if (previousVersion) {
        const newPieces = await this.agendaService.changedPieces(this.currentAgenda.id, previousAgenda.id, agendaitem.id);
        if (newPieces.length > 0) {
          pieces.push(...newPieces);
        }
      }
    });
    yield all(agendaitemNewPieces);
    this.set('piecesToDeleteReopenPreviousAgenda', sortPieces(pieces));
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    print() {
      window.print();
    },

    cancel() {
      this.set('releasingDecisions', false);
      this.set('releasingDocuments', false);
      this.set('isApprovingAllAgendaitems', false);
    },

    async showApproveAllAgendaitemsWarning() {
      await this.ensureAgendaDataIsRecent();
      this.set('isApprovingAllAgendaitems', true);
    },

    async approveAllAgendaitems() {
      this.set('isApprovingAllAgendaitems', false);
      this.toggleLoadingOverlayWithMessage(this.intl.t('approve-all-agendaitems-message'));
      const allAgendaitemsNotOk = await this.currentAgenda.get('allAgendaitemsNotOk');
      for (const agendaitem of allAgendaitemsNotOk) {
        try {
          await setAgendaitemFormallyOk(agendaitem);
        } catch {
          await agendaitem.rollbackAttributes();
        }
      }
      this.toggleLoadingOverlayWithMessage(null);
      this.onRefreshNeeded();
    },

    async unlockAgenda() {
      // TODO bevestiging ?
      await this.createDesignAgenda();
    },

    addAgendaitemsAction() {
      this.set('isAddingAgendaitems', true);
    },

    async downloadAllDocuments() {
      // timeout options is in milliseconds. when the download is ready, the toast should last very long so users have a time to click it
      const fileDownloadToast = {
        title: this.intl.t('file-ready'),
        type: 'download-file',
        options: {
          timeOut: 60 * 10 * 1000,
        },
      };

      const namePromise = constructArchiveName(this.currentAgenda);
      debug('Checking if archive exists ...');
      const jobPromise = fetchArchivingJobForAgenda(this.currentAgenda, this.store);
      const [name, job] = await all([namePromise, jobPromise]);
      if (!job) {
        this.toaster.warning(this.intl.t('no-documents-to-download-warning-text'), this.intl.t('no-documents-to-download-warning-title'), {
          timeOut: 10000,
        });
        return;
      }
      if (!job.hasEnded) {
        debug('Archive in creation ...');
        const inCreationToast = this.toaster.loading(this.intl.t('archive-in-creation-message'),
          this.intl.t('archive-in-creation-title'), {
            timeOut: 3 * 60 * 1000,
          });
        this.jobMonitor.register(job);
        job.on('didEnd', this, async function(status) {
          if (this.toaster.toasts.includes(inCreationToast)) {
            this.toaster.toasts.removeObject(inCreationToast);
          }
          if (status === job.SUCCESS) {
            const url = await fileDownloadUrlFromJob(job, name);
            debug(`Archive ready. Prompting for download now (${url})`);
            fileDownloadToast.options.downloadLink = url;
            fileDownloadToast.options.fileName = name;
            this.toaster.displayToast.perform(fileDownloadToast);
          } else {
            debug('Something went wrong while generating archive.');
            this.toaster.error(this.intl.t('error'), this.intl.t('warning-title'));
          }
        });
      } else {
        const url = await fileDownloadUrlFromJob(job, name);
        debug(`Archive ready. Prompting for download now (${url})`);
        fileDownloadToast.options.downloadLink = url;
        fileDownloadToast.options.fileName = name;
        this.toaster.displayToast.perform(fileDownloadToast);
      }
    },

    async createNewDesignAgendaAction() {
      await this.createDesignAgenda();
    },
    releaseDecisions() {
      this.set('releasingDecisions', true);
    },
    confirmReleaseDecisions() {
      this.set('releasingDecisions', false);
      this.currentSession.set('releasedDecisions', moment().utc()
        .toDate());
      this.currentSession.save();
    },
    releaseDocuments() {
      this.set('releasingDocuments', true);
    },
    confirmReleaseDocuments() {
      this.set('releasingDocuments', false);
      this.currentSession.set('releasedDocuments', moment().utc()
        .toDate());
      this.currentSession.save();
    },
    toggleEditingSession() {
      this.toggleProperty('editingSession');
    },
    successfullyEdited() {
      this.toggleProperty('editingSession');
    },
    cancelEditSessionForm() {
      this.toggleProperty('editingSession');
    },

    async openConfirmApproveAgenda() {
      await this.ensureAgendaDataIsRecent();
      this.set('showConfirmForApprovingAgenda', true);
    },

    async confirmApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
      await this.approveCurrentAgenda();
    },

    cancelApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
    },

    async openConfirmApproveAgendaAndCloseMeeting() {
      await this.ensureAgendaDataIsRecent();
      this.set('showConfirmForApprovingAgendaAndClosingMeeting', true);
    },

    async confirmApproveAgendaAndCloseMeeting() {
      this.set('showConfirmForApprovingAgendaAndClosingMeeting', false);
      await this.approveCurrentAgendaAndCloseMeeting();
    },

    cancelApproveAgendaAndCloseMeeting() {
      this.set('showConfirmForApprovingAgendaAndClosingMeeting', false);
    },

    openConfirmCloseMeeting() {
      this.set('showConfirmForClosingMeeting', true);
    },

    async confirmCloseMeeting() {
      this.set('showConfirmForClosingMeeting', false);
      await this.closeMeeting();
    },

    cancelCloseMeeting() {
      this.set('showConfirmForClosingMeeting', false);
    },

    openConfirmDeleteSelectedAgenda() {
      this.set('showConfirmForDeletingSelectedAgenda', true);
    },

    async confirmDeleteSelectedAgenda() {
      this.set('showConfirmForDeletingSelectedAgenda', false);
      await this.deleteSelectedAgenda();
    },

    cancelDeleteSelectedAgenda() {
      this.set('showConfirmForDeletingSelectedAgenda', false);
    },

    async openConfirmReopenPreviousAgenda() {
      await this.get('lastApprovedAgenda').then((agenda) => agenda); // The computed is not loaded before the message with params is sent to the modal, so wait here
      this.loadPiecesToDelete.perform();
      this.set('showConfirmForReopeningPreviousAgenda', true);
    },

    async confirmReopenPreviousAgenda() {
      this.set('showConfirmForReopeningPreviousAgenda', false);
      await this.reopenPreviousAgenda();
    },

    cancelReopenPreviousAgenda() {
      this.set('piecesToDeleteReopenPreviousAgenda', null);
      this.set('showConfirmForReopeningPreviousAgenda', false);
    },

  },

});
