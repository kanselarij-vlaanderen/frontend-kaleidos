import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  alias, filter
} from '@ember/object/computed';
import {
  computed, set
} from '@ember/object';
import {
  warn, debug
} from '@ember/debug';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import { all } from 'rsvp';
import {
  setAgendaitemFormallyOk,
  getListOfAgendaitemsThatAreNotFormallyOk,
  getAgendaitemsFromAgendaThatDontHaveFormallyOkStatus
} from 'fe-redpencil/utils/agendaitem-utils';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
} from 'fe-redpencil/utils/zip-agenda-files';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend(FileSaverMixin, {
  classNames: ['vlc-page-header'],

  store: service(),
  sessionService: service('session-service'),
  currentSessionService: service('current-session'),
  agendaService: service(),
  fileService: service(),
  router: service(),
  intl: service(),
  jobMonitor: service(),
  toaster: service(),

  showCloseWarning: false,
  isShowingOptions: false,
  isPrintingNotes: false,
  isAddingAgendaitems: false,
  isApprovingAgenda: false,
  isDeletingAgenda: false,
  isLockingAgenda: false,
  isShowingAgendaActions: false,
  onCreateAgendaitem: null, // argument. Function to execute after creating an agenda-item.
  onApproveAgenda: null, // argument. Function to execute after approving an agenda.
  isApprovingAllAgendaitems: false,
  isShowingWarningOnClose: false,

  currentAgendaitems: alias('sessionService.currentAgendaitems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),
  selectedAgendaitem: alias('sessionService.selectedAgendaitem'),
  definiteAgendas: alias('sessionService.definiteAgendas'),

  isLockable: computed('agendas.@each', async function() {
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

  amountOfAgendaitemsNotFormallyOk: computed('currentAgendaitems.@each.formallyOk', async function() {
    const isNotFormallyOk = (agendaitem) => agendaitem.formallyOk !== CONFIG.formallyOk;
    const agendaitems = await this.currentAgenda.get('agendaitems');
    return agendaitems.filter(isNotFormallyOk).length;
  }),

  currentAgendaIsLast: computed('currentSession', 'currentAgenda', 'currentSession.agendas.@each', async function() {
    return await this.get('currentSession.sortedAgendas.firstObject.id') === await this.currentAgenda.get('id');
  }),

  designAgendaPresent: filter('currentSession.agendas.@each.isDesignAgenda', (agenda) => agenda.get('isDesignAgenda')),

  shouldShowLoader: computed('isDeletingAgenda', 'isLockingAgenda', function() {
    return this.isDeletingAgenda || this.isLockingAgenda;
  }),

  loaderText: computed('isDeletingAgenda', 'isLockingAgenda', function() {
    let text = '';
    if (this.isDeletingAgenda) {
      text = this.intl.t('agenda-delete-message');
    }
    if (this.isLockingAgenda) {
      text = this.intl.t('agenda-lock-message');
    }
    return `${text} ${this.intl.t('please-be-patient')}`;
  }),

  loaderTitle: computed('isDeletingAgenda', 'isLockingAgenda', function() {
    if (this.isDeletingAgenda) {
      return this.intl.t('agenda-delete');
    }
    if (this.isLockingAgenda) {
      return this.intl.t('agenda-lock');
    }
    return '';
  }),

  async createDesignAgenda() {
    this.changeLoading();
    const session = this.get('currentSession');
    session.set('isFinal', false);
    session.set('agenda', null);
    await session.save();
    const definiteAgendas = await this.get('definiteAgendas');
    const lastDefiniteAgenda = await definiteAgendas.get('firstObject');
    const approved = await this.store.findRecord('agendastatus', CONFIG.agendaStatusApproved.id);
    lastDefiniteAgenda.set('status', approved);
    await lastDefiniteAgenda.save();
    this.get('agendaService')
      .approveAgendaAndCopyToDesignAgenda(session, lastDefiniteAgenda)
      .then((newAgenda) => {
        this.changeLoading();
        this.onApproveAgenda(newAgenda.get('id'));
      });
  },

  async deleteAgenda(agenda) {
    const session = await this.currentSession;
    if (!agenda) {
      // TODO possible dead code, there is always an agenda ?
      return;
    }
    const agendas = await session.get('agendas');
    const agendasLength = agendas.length;

    const previousAgenda = await this.get('sessionService').findPreviousAgendaOfSession(session, agenda);
    await this.agendaService.deleteAgenda(agenda);
    if (previousAgenda) {
      await session.save();
      await this.set('sessionService.currentAgenda', previousAgenda);
      this.router.transitionTo('agenda.agendaitems', session.id, previousAgenda.get('id'));
    } else if (agendasLength === 1) {
      await this.get('sessionService').deleteSession(session);
      this.router.transitionTo('agendas');
    } else { // dead code, this should not be reachable unless previousAgenda failed to resolve
      throw new Error('Something went wrong when deleting the agenda, contact developers');
    }
  },

  reloadAgendaitemsOfSubcases(agendaitems) {
    return all(agendaitems.map(async(agendaitem) => {
      const agendaActivity = await agendaitem.get('agendaActivity');
      if (agendaActivity) {
        await agendaActivity.hasMany('agendaitems').reload();
      }
      return agendaitem;
    })).catch(() => {
      warn('Something went wrong while reloading the agendaitems of the subcases.', {
        id: 'subcase-reloading',
      });
    });
  },

  destroyAgendaitemsList(agendaitems) {
    return all(agendaitems.map((agendaitem) => {
      if (!agendaitem) {
        return null;
      }
      return agendaitem.destroyRecord().catch(() => warn('Something went wrong while deleting the agendaitem.', {
        id: 'agenda-item-reloading',
      }));
    }));
  },

  async lockAgenda(lastAgenda) {
    this.set('isLockingAgenda', true);
    const meetingOfAgenda = await this.currentAgenda.get('createdFor');
    // Als je deze reload niet doet dan refreshed de interface niet (Ember).
    await meetingOfAgenda.hasMany('agendas').reload();
    meetingOfAgenda.set('isFinal', true);
    meetingOfAgenda.set('agenda', lastAgenda);
    await meetingOfAgenda.save();

    const closed = await this.store.findRecord('agendastatus', CONFIG.agendaStatusClosed.id);
    lastAgenda.set('status', closed);
    await lastAgenda.save();
    this.set('sessionService.currentSession.agendas', meetingOfAgenda.agendas);

    if (!this.isDestroyed) {
      this.set('isLockingAgenda', false);
    }
  },
  async closeAgenda() {
    const isClosable = await this.currentAgenda.get('isClosable');
    if (isClosable) {
      this.set('isLockingAgenda', true);
      const agendas = await this.get('agendas');
      const designAgenda = agendas
        .filter((agenda) => agenda.get('isDesignAgenda'))
        .sortBy('-serialnumber')
        .get('firstObject');
      const lastAgenda = agendas
        .filter((agenda) => !agenda.get('isDesignAgenda'))
        .sortBy('-serialnumber')
        .get('firstObject');

      const session = await lastAgenda.get('createdFor');
      session.set('isFinal', true);
      session.set('agenda', lastAgenda);

      await session.save();
      const closed = await this.store.findRecord('agendastatus', CONFIG.agendaStatusClosed.id); // Async call
      lastAgenda.set('status', closed);
      await lastAgenda.save();

      if (designAgenda) {
        await this.deleteAgenda(designAgenda);
      }
      if (!this.isDestroyed) {
        this.set('isLockingAgenda', false);
      }
    } else {
      this.set('isShowingWarningOnClose', true);
    }
  },
  actions: {
    async removeAgendaitemsFromAgendaThatDontHaveFormallyOkStatus() {
      const agendaitemsToRemoveFromCurrentAgenda = await getAgendaitemsFromAgendaThatDontHaveFormallyOkStatus(this.currentAgenda);
      if (agendaitemsToRemoveFromCurrentAgenda.length > 0) {
        for (const agendaitem of agendaitemsToRemoveFromCurrentAgenda) {
          await this.agendaService.deleteAgendaitem(agendaitem);
        }
        this.set('showCloseWarning', false);
      }
      const isClosable = await this.currentAgenda.get('isClosable');
      if (isClosable) {
        this.set('isShowingWarningOnClose', true);
      }
    },

    print() {
      window.print();
    },

    navigateToNotes() {
      const {
        currentSession, currentAgenda,
      } = this;
      this.navigateToNotes(currentSession.get('id'), currentAgenda.get('id'));
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
      this.set('showWarning', false);
      this.set('releasingDecisions', false);
      this.set('releasingDocuments', false);
      this.set('isApprovingAllAgendaitems', false);
    },

    verify() {
      this.set('showWarning', false);
    },

    async tryToApproveAgenda(session) {
      const isApprovable = await this.currentAgenda.get('isApprovable');
      if (!isApprovable) {
        this.set('showWarning', true);
      } else {
        await this.approveAgenda(session);
      }
    },

    async doApproveAgenda(session) {
      set(this, 'showWarning', false);
      await this.approveAgenda(session);
    },

    async approveAndCloseAgenda() {
      const session = this.get('currentSession');
      const isClosable = await this.currentAgenda.get('isClosable');
      if (isClosable) {
        const meetingOfAgenda = await this.currentAgenda.get('createdFor');
        const agendasOfMeeting = await meetingOfAgenda.get('agendas');

        this.set('isApprovingAgenda', true);
        this.changeLoading();
        const agendaToLock = await agendasOfMeeting.find((agenda) => agenda.get('isDesignAgenda'));

        agendaToLock.set(
          'modified',
          moment()
            .utc()
            .toDate()
        );
        agendaToLock.save().then(async(agendaToApprove) => {
          await this.agendaService.approveAgenda(session, agendaToApprove);
          return agendaToApprove;
        })
          .then(async(agendaToApprove) => {
            // We reloaden de agenda hier om de recente changes m.b.t. het approven van de agenda binnen te halen
            const reloadedAgenda = await this.store.findRecord('agenda', agendaToApprove.get('id'), {
              reload: true,
              include: 'status',
            });
            await this.lockAgenda(reloadedAgenda);
          })
          .finally(() => {
            this.set('sessionService.selectedAgendaitem', null);
            this.changeLoading();
            this.set('isApprovingAgenda', false);
          });
        this.set('showApproveAndCloseWarning', false);
      } else {
        this.set('showCloseWarning', true);
      }
    },

    cancelLockAgenda() {
      this.set('showCloseWarning', false);
    },
    cancelCloseAgenda() {
      this.set('isShowingWarningOnClose', false);
    },

    async lockAgendaAction() {
      const isClosable = await this.currentAgenda.get('isClosable');
      const isApproved = await this.currentAgenda.get('isApproved');
      if (isClosable) {
        if (isApproved) {
          this.set('isShowingWarningOnClose', true);
        } else {
          this.set('showApproveAndCloseWarning', true);
        }
      } else {
        this.set('showCloseWarning', true);
      }
    },

    async closeAgendaAction() {
      await this.closeAgenda();
      this.set('isShowingWarningOnClose', false);
    },

    showApproveAllAgendaitemsWarning() {
      this.set('isApprovingAllAgendaitems', true);
    },

    async approveAllAgendaitems() {
      const agendaitemsFromAgenda = await this.currentAgenda.get('agendaitems');
      const listOfNotFormallyOkagendaitems = getListOfAgendaitemsThatAreNotFormallyOk(agendaitemsFromAgenda);
      listOfNotFormallyOkagendaitems.forEach((agendaitem) => {
        setAgendaitemFormallyOk(agendaitem);
      });
      this.set('isApprovingAllAgendaitems', false);
    },

    async unlockAgenda() {
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

    navigateToSubCases() {
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

    async deleteAgenda(agenda) {
      this.set('isDeletingAgenda', true);
      await this.deleteAgenda(agenda);
      if (!this.isDestroyed) {
        this.set('isDeletingAgenda', false);
      }
    },

    async createNewDesignAgenda() {
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
  },

  changeLoading() {
    this.loading();
  },

  async approveAgenda(session) {
    if (this.get('isApprovingAgenda')) {
      return;
    }
    this.set('isApprovingAgenda', true);
    this.changeLoading();
    const agendas = await this.get('agendas');
    let agendaToLock = await agendas.find((agenda) => agenda.get('isDesignAgenda'));
    if (agendaToLock) {
      agendaToLock = await this.store.findRecord('agenda', agendaToLock.get('id'));
    }

    agendaToLock.set(
      'modified',
      moment()
        .utc()
        .toDate()
    );
    agendaToLock.save().then((agendaToApprove) => {
      this.get('agendaService')
        .approveAgendaAndCopyToDesignAgenda(session, agendaToApprove)
        .then(async(newAgenda) => {
          const agendaitems = await agendaToLock.get('agendaitems');
          const newNotYetOKItems = agendaitems.filter((agendaitem) => agendaitem.get('isAdded') && agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk);
          await this.reloadAgendaitemsOfSubcases(agendaitems);
          await this.destroyAgendaitemsList(newNotYetOKItems);
          return newAgenda;
        })
        .then((newAgenda) => {
          if (this.onApproveAgenda) {
            this.onApproveAgenda(newAgenda.get('id'));
          }
        })
        .finally(() => {
          this.set('sessionService.selectedAgendaitem', null);
          this.changeLoading();
          this.set('isApprovingAgenda', false);
        });
    });
  },
});
