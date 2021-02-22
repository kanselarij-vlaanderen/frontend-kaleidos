import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  alias, filter
} from '@ember/object/computed';
import { computed } from '@ember/object';
import { debug } from '@ember/debug';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import { all } from 'rsvp';
import {
  setAgendaitemFormallyOk,
  reorderAgendaitemsOnAgenda
} from 'frontend-kaleidos/utils/agendaitem-utils';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
} from 'frontend-kaleidos/utils/zip-agenda-files';
import CONFIG from 'frontend-kaleidos/utils/config';
import moment from 'moment';
import agendaitem from '../../../../adapters/agendaitem';
import { A } from '@ember/array';

export default Component.extend(FileSaverMixin, {
  classNames: ['vlc-page-header'],

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

  isShowingOptions: false,
  isAddingAgendaitems: false,
  isShowingAgendaActions: false,
  onCreateAgendaitem: null, // argument. Function to execute after creating an agenda-item.
  onApproveAgenda: null, // argument. Function to execute after approving an agenda.
  isApprovingAllAgendaitems: false,
  showLoadingOverlay: false,
  loadingOverlayMessage: null,
  showConfirmForApprovingAgenda: false,
  showConfirmForApprovingAgendaAndClosingMeeting: false,
  showConfirmForClosingMeeting: false,
  showConfirmForDeletingSelectedAgenda: false,
  showConfirmForReopeningPreviousAgenda: false,

  currentAgendaitems: alias('sessionService.currentAgendaitems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'), // This list is reverse sorted on serialnumber
  selectedAgendaitem: alias('sessionService.selectedAgendaitem'),

  /**
   * @computed isSessionClosable
   *
   * The session is closable when there are more than 1 agendas OR when there is only 1 agenda that is not a design agenda
   * @return {boolean}
   */
  isSessionClosable: computed('agendas.@each', async function() {
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
  lastApprovedAgenda: computed('agendas.@each', async function() {
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

  currentAgendaIsLast: computed('currentSession', 'currentAgenda', 'currentSession.agendas.@each', async function() {
    return await this.get('currentSession.sortedAgendas.firstObject.id') === await this.currentAgenda.get('id');
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
  canReopenPreviousAgenda: computed('currentSession', 'currentAgenda', 'isSessionClosable', 'currentAgendaIsLast', async function() {
    const isSessionClosable = await this.isSessionClosable;
    const isAdminAndLastAgenda = this.currentSessionService.isAdmin && await this.currentAgendaIsLast; // TODO why are these together ?

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
  canDeleteSelectedAgenda: computed('currentAgenda', 'currentAgendaIsLast', async function() {
    const isAdminAndLastAgenda = this.currentSessionService.isAdmin && await this.currentAgendaIsLast; // TODO why are these together ?
    if (this.currentAgenda.isDesignAgenda || isAdminAndLastAgenda) {
      return true;
    }
    return false;
  }),

  /**
   * reloadAgendaitemsOfAgendaActivities
   * After a new designagenda is created in the service (approveAgendaAndCopyToDesignAgenda) we need to update the agenda activities
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
    const session = this.get('currentSession');
    session.set('isFinal', false);
    session.set('agenda', null);
    await session.save();
    const lastApprovedAgenda = await this.get('lastApprovedAgenda');
    const approved = await this.store.findRecord('agendastatus', CONFIG.agendaStatusApproved.id);
    lastApprovedAgenda.set('status', approved); // will only have an effect in case of status "closed"
    await lastApprovedAgenda.save();
    this.get('agendaService')
      .approveAgendaAndCopyToDesignAgenda(session, lastApprovedAgenda)
      .then(async(newAgenda) => {
        // After the agenda has been approved, we want to update the agendaitems of activities
        const agendaitems = await lastApprovedAgenda.get('agendaitems');
        await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
        this.toggleLoadingOverlayWithMessage(null);
        this.onApproveAgenda(newAgenda.get('id'));
      });
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
    // We set the status of the agenda to approved (instead of in service)
    const approvedStatus = await this.store.findRecord('agendastatus', CONFIG.agendaStatusApproved.id);
    currentDesignAgenda.set(
      'modified',
      moment()
        .utc()
        .toDate()
    );
    currentDesignAgenda.set('status', approvedStatus);
    currentDesignAgenda.save();
    const newAgenda = await this.get('agendaService').approveAgendaAndCopyToDesignAgenda(currentMeeting, currentDesignAgenda);
    // rename for clarity, agenda is now approved
    const approvedAgenda = currentDesignAgenda;
    // TODO What if service fails ?
    if (newAgenda) {
      // After the agenda has been approved, we want to update the agendaitems of activity
      const agendaitems = await currentDesignAgenda.get('agendaitems');
      await this.reloadAgendaitemsOfAgendaActivities(agendaitems);

      // proceed with only the specific agendaitems that were not ok before approving
      const agendaitemsNotFormallyOk = await approvedAgenda.get('allAgendaitemsNotOk');
      if (agendaitemsNotFormallyOk.length > 0) {
        const isEditor = this.currentSessionService.isEditor;
        const agendaitemsToMove = A([]);
        const agendaitemsToRollback = A([]);
        // CHECK IF FORMAL NOT OK NEEDS TO BE ROLLED BACK, FORMAL OK SHOULD NOT BE ON APPROVED AGENDA ACCORDING TO KENNY
        for (agendaitem of agendaitemsNotFormallyOk) {
          const previousVersion = await agendaitem.get('previousVersion');
          if (previousVersion) {
            agendaitemsToRollback.pushObject(agendaitem);
          } else {
            agendaitemsToMove.pushObject(agendaitem);
          }
        }

        // Old agenda: new agendaitems that have been moved to the new agenda must be removed from the old agenda, resort old agendaitems
        if (agendaitemsToMove.length > 0) {
          for (agendaitem of agendaitemsToMove) {
            // destroyRecord ensures only this agendaitem is deleted and does not do any cascading deletes
            await agendaitem.destroyRecord();
          }
        }

        // Old agenda: already approved agendaitems that were not formally ok will be rolled back to the previous version
        if (agendaitemsToRollback.length > 0) {
          await this.agendaService.rollbackAgendaitemsNotFormallyOk(approvedAgenda);
          for (agendaitem of agendaitemsToRollback) {
            await agendaitem.reload();
            // Do we need to reload everything, possible side effects? we could check if a value was present, and only reload those.
            await agendaitem.hasMany('pieces').reload();
            await agendaitem.hasMany('treatments').reload();
            await agendaitem.hasMany('mandatees').reload();
            await agendaitem.hasMany('approvals').reload();
            await agendaitem.hasMany('linkedPieces').reload();
          }
        }
        await reorderAgendaitemsOnAgenda(approvedAgenda, isEditor);

        // New agenda: new agendaitems that have been moved must be resorted to the bottom of the lists (note && announcements) on new agenda
        const agendaitemsFromNewAgenda = await newAgenda.get('agendaitems');
        const newAgendaitemsToReorder = A([]);
        const newAgendaitemsWithStatusDifferentFromFormallyOk = agendaitemsFromNewAgenda.filter((agendaitem) => (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
        for (agendaitem of newAgendaitemsWithStatusDifferentFromFormallyOk) {
          const previousVersion = await agendaitem.get('previousVersion');
          if (!previousVersion) {
            newAgendaitemsToReorder.pushObject(agendaitem);
          }
        } // TODO rolled back items also bottom of the list ?
        if (newAgendaitemsToReorder.length > 0) {
          newAgendaitemsToReorder.forEach((agendaitem) => {
            agendaitem.set('priority', agendaitem.get('priority') + 9999);
          });
          await reorderAgendaitemsOnAgenda(newAgenda, isEditor);
        }
      }
    }

    if (this.onApproveAgenda) {
      this.set('sessionService.selectedAgendaitem', null);
      this.toggleLoadingOverlayWithMessage(null);
      this.onApproveAgenda(newAgenda.get('id'));
    }
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
    const isDesignAgenda = await this.currentAgenda.get('isDesignAgenda');
    if (isDesignAgenda) {
      const currentMeeting = this.get('currentSession');
      const agendaToApproveAndClose = this.currentAgenda;
      // We have to change the current agenda from design to closed status, skipping the approval status
      const closedStatus = await this.store.findRecord('agendastatus', CONFIG.agendaStatusClosed.id);
      agendaToApproveAndClose.set(
        'modified',
        moment()
          .utc()
          .toDate()
      );
      agendaToApproveAndClose.set('status', closedStatus);
      agendaToApproveAndClose.save();

      // Als je deze reload niet doet dan refreshed de interface niet (Ember).
      await currentMeeting.hasMany('agendas').reload();
      currentMeeting.set('isFinal', true);
      currentMeeting.set('agenda', agendaToApproveAndClose);
      await currentMeeting.save();

      const agendaitemsFromApprovedAgenda = await agendaToApproveAndClose.get('agendaitems');
      const agendaitemsWithStatusDifferentFromFormallyOk = agendaitemsFromApprovedAgenda.filter((agendaitem) => (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
      if (agendaitemsWithStatusDifferentFromFormallyOk.length > 0) {
        const isEditor = this.currentSessionService.isEditor;
        const agendaitemsToRemove = A([]);
        const agendaitemsToRollback = A([]);
        for (agendaitem of agendaitemsWithStatusDifferentFromFormallyOk) {
          const previousVersion = await agendaitem.get('previousVersion');
          if (previousVersion) {
            agendaitemsToRollback.pushObject(agendaitem);
          } else {
            agendaitemsToRemove.pushObject(agendaitem);
          }
        }

        // Old agenda: new agendaitems that need te be removed from the agenda must be propoable again, resort old agendaitems
        if (agendaitemsToRemove.length > 0) {
          for (agendaitem of agendaitemsToRemove) {
            await this.agendaService.deleteAgendaitem(agendaitem);
          }
        }

        // Old agenda: already approved agendaitems that were not formally ok will be rolled back to the previous version
        if (agendaitemsToRollback.length > 0) {
          await this.agendaService.rollbackAgendaitemsNotFormallyOk(agendaToApproveAndClose);
          for (agendaitem of agendaitemsToRollback) {
            await agendaitem.reload();
            // Do we need to reload everything, possible side effects? we could check if a value was present, and only reload those.
            await agendaitem.hasMany('pieces').reload();
            await agendaitem.hasMany('treatments').reload();
            await agendaitem.hasMany('mandatees').reload();
            await agendaitem.hasMany('approvals').reload();
            await agendaitem.hasMany('linkedPieces').reload();
          }
        }
        await reorderAgendaitemsOnAgenda(agendaToApproveAndClose, isEditor);
      }
      this.toggleLoadingOverlayWithMessage(null);
    }
  },

  /**
   * closeMeeting
   *
   * This method will delete the current design agenda (if applicable) and close the meeting
   */
  async closeMeeting() {
    this.toggleLoadingOverlayWithMessage(this.intl.t('agenda-close-message'));
    if (this.isSessionClosable) {
      const currentMeeting = this.currentSession;
      const agendas = await this.get('agendas');
      const designAgenda = agendas
        .filter((agenda) => agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');
      const lastApprovedAgenda = await this.get('lastApprovedAgenda');

      if (lastApprovedAgenda) {
        currentMeeting.set('isFinal', true);
        currentMeeting.set('agenda', lastApprovedAgenda);
        await currentMeeting.save();

        const closed = await this.store.findRecord('agendastatus', CONFIG.agendaStatusClosed.id);
        lastApprovedAgenda.set('status', closed);
        await lastApprovedAgenda.save();
      }

      if (designAgenda) {
        await this.agendaService.deleteAgenda(designAgenda);
        // TODO is alle data uit de local store na deze actie ?
        // After the agenda has been deleted, we want to update the agendaitems of activity
        const agendaitems = await lastApprovedAgenda.get('agendaitems');
        await this.reloadAgendaitemsOfAgendaActivities(agendaitems);
        await this.set('sessionService.currentAgenda', lastApprovedAgenda);
        this.router.transitionTo('agenda.agendaitems', currentMeeting.id, lastApprovedAgenda.get('id'));
      }
    }

    if (!this.isDestroyed) {
      this.toggleLoadingOverlayWithMessage(null);
    }
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
      const agendas = await this.get('agendas');
      const currentAgenda = this.currentAgenda;
      const agendasLength = agendas.length;
      const currentMeeting = await this.currentSession;

      // this could be previousVersion of agenda, but is not implemented
      const previousAgenda = await this.get('sessionService').findPreviousAgendaOfSession(currentMeeting, currentAgenda);
      currentMeeting.set('agenda', previousAgenda); // TODO setting this here might result in a one-to-many with multiple on the "one" side on future agenda versions
      await currentMeeting.save();

      await this.agendaService.deleteAgenda(currentAgenda);

      // TODO The deleteAgenda will also make new agendaitems that were removed proposable again. Do we want to display this information in the confirmation screen ?
      if (previousAgenda) {
        // After the agenda has been deleted, we want to update the agendaitems of activity
        const agendaitems = await previousAgenda.get('agendaitems');
        await this.reloadAgendaitemsOfAgendaActivities(agendaitems);

        await this.set('sessionService.currentAgenda', previousAgenda);
        this.router.transitionTo('agenda.agendaitems', currentMeeting.id, previousAgenda.get('id'));
      } else if (agendasLength === 1) {
        await this.get('sessionService').deleteSession(currentMeeting);
        this.router.transitionTo('agendas');
      } else { // dead code, this should not be reachable unless previousAgenda failed to resolve
        throw new Error('Something went wrong when deleting the agenda, contact developers');
      }
    }
    if (!this.isDestroyed) {
      this.toggleLoadingOverlayWithMessage(null);
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
    if (await this.canReopenPreviousAgenda) {
      const agendas = await this.get('agendas');
      const designAgenda = this.currentAgenda;

      // this could be previousVersion of agenda, but is not implemented
      const previousAgenda = agendas
        .filter((agenda) => !agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');

      const currentMeeting = await this.currentSession;
      currentMeeting.set('agenda', previousAgenda);
      await currentMeeting.save();

      const designAgendaStatus = await this.store.findRecord('agendastatus', CONFIG.agendaStatusDesignAgenda.id); // Async call
      previousAgenda.set('status', designAgendaStatus);
      await previousAgenda.save();

      await this.agendaService.deleteAgenda(designAgenda);
      // After the agenda has been deleted, we want to update the agendaitems of activity
      const agendaitems = await previousAgenda.get('agendaitems');
      await this.reloadAgendaitemsOfAgendaActivities(agendaitems);

      await this.set('sessionService.currentAgenda', previousAgenda);
      this.router.transitionTo('agenda.agendaitems', currentMeeting.id, previousAgenda.get('id'));
    }
    if (!this.isDestroyed) {
      this.toggleLoadingOverlayWithMessage(null);
    }
  },

  actions: {
    print() {
      window.print();
    },

    navigateToPressAgenda() {
      const {
        currentSession, currentAgenda,
      } = this;
      this.navigateToPressAgenda(currentSession.get('id'), currentAgenda.get('id'));
    },

    navigateToNewsletter() {
      const {
        currentSession, currentAgenda,
      } = this;
      this.navigateToNewsletter(currentSession.get('id'), currentAgenda.get('id'));
    },

    navigateToDecisions() {
      const {
        currentSession, currentAgenda,
      } = this;
      this.navigateToDecisions(currentSession.get('id'), currentAgenda.get('id'));
    },

    clearSelectedAgendaitem() {
      this.clearSelectedAgendaitem();
    },

    cancel() {
      this.set('releasingDecisions', false);
      this.set('releasingDocuments', false);
      this.set('isApprovingAllAgendaitems', false);
    },

    showApproveAllAgendaitemsWarning() {
      this.set('isApprovingAllAgendaitems', true);
    },

    async approveAllAgendaitems() {
      this.set('isApprovingAllAgendaitems', false);
      this.toggleLoadingOverlayWithMessage(this.intl.t('approve-all-agendaitems-message'));
      const allAgendaitemsNotOk = await this.currentAgenda.get('allAgendaitemsNotOk');
      for (const agendaitem of allAgendaitemsNotOk) {
        await setAgendaitemFormallyOk(agendaitem);
      }
      this.toggleLoadingOverlayWithMessage(null);
    },

    async unlockAgenda() {
      // TODO bevestiging ?
      await this.createDesignAgenda();
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    showAgendaActions() {
      this.toggleProperty('isShowingAgendaActions');
    },

    compareAgendas() {
      this.compareAgendas();
    },

    addAgendaitemsAction() {
      this.set('isAddingAgendaitems', true);
    },

    navigateToDocuments() {
      this.navigateToDocuments();
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
    selectSignature() {
      this.toggleProperty('isAssigningSignature', false);
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

    openConfirmApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', true);
    },

    async confirmApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
      await this.approveCurrentAgenda();
    },

    cancelApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
    },

    openConfirmApproveAgendaAndCloseMeeting() {
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
      this.set('showConfirmForReopeningPreviousAgenda', true);
    },

    async confirmReopenPreviousAgenda() {
      this.set('showConfirmForReopeningPreviousAgenda', false);
      await this.reopenPreviousAgenda();
    },

    cancelReopenPreviousAgenda() {
      this.set('showConfirmForReopeningPreviousAgenda', false);
    },

  },

});
