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
  getAgendaitemsFromAgendaThatDontHaveFormallyOkStatus,
  reorderAgendaitemsOnAgenda
} from 'fe-redpencil/utils/agendaitem-utils';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
} from 'fe-redpencil/utils/zip-agenda-files';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
import agendaitem from '../../../../adapters/agendaitem';
import { A } from '@ember/array';

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
  isAddingAgendaitems: false,
  isApprovingAgenda: false,
  isDeletingAgenda: false,
  isClosingAgenda: false,
  isShowingAgendaActions: false,
  onCreateAgendaitem: null, // argument. Function to execute after creating an agenda-item.
  onApproveAgenda: null, // argument. Function to execute after approving an agenda.
  isApprovingAllAgendaitems: false,
  isShowingWarningOnClose: false,
  showWarningForApprovingAgenda: false,
  showConfirmReopenPreviousAgenda: false,
  showConfirmDeleteCurrentAgenda: false,
  showApproveAndCloseWarning: false,

  currentAgendaitems: alias('sessionService.currentAgendaitems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'), // This list is reverse sorted on serialNumber
  selectedAgendaitem: alias('sessionService.selectedAgendaitem'),
  definiteAgendas: alias('sessionService.definiteAgendas'),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),

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

  lastAgendaName: computed('agendas.@each', async function() {
    const agendas = await this.get('agendas');
    const lastAgendaFromList = agendas
      .filter((agenda) => !agenda.get('isDesignAgenda'))
      .sortBy('serialnumber')
      .reverse()
      .get('firstObject');
    return lastAgendaFromList.agendaName;
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

  shouldShowLoader: computed('isDeletingAgenda', 'isClosingAgenda', function() {
    return this.isDeletingAgenda || this.isClosingAgenda;
  }),

  loaderText: computed('isDeletingAgenda', 'isClosingAgenda', function() {
    let text = '';
    if (this.isDeletingAgenda) {
      text = this.intl.t('agenda-delete-message');
    }
    if (this.isClosingAgenda) {
      text = this.intl.t('agenda-close-message');
    }
    return `${text} ${this.intl.t('please-be-patient')}`;
  }),

  loaderTitle: computed('isDeletingAgenda', 'isClosingAgenda', function() {
    if (this.isDeletingAgenda) {
      return this.intl.t('agenda-delete');
    }
    if (this.isClosingAgenda) {
      return this.intl.t('agenda-close');
    }
    return '';
  }),


  /**
   * CreateDesignAgenda
   *
   * Get the last approved agenda and change te status to approves (from final)
   * Then approve that agenda using the agenda-approve service which yields a new design agenda
   */
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
    this.set('isClosingAgenda', true);
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
      this.set('isClosingAgenda', false);
    }
  },

  /**
   * closeAgenda
   *
   * Deze functie gaat de huidige zitting afsluiten. Als er een ontwerpagenda is zal deze verwijderd worden.
   * De laatst goedgekeurde agenda wordt genomen als finale agenda in deze zitting.
   * Agendaitems die nieuw waren op deze ontwerpagenda moeten terug agendeerbaar worden (gebeurd in service)
   * Agendaitems die aanpassingen hebben gekregen (nieuwe docs, andere ministers) gaan verloren door verwijdering, echter bestaan die changes nog op procedurestap
   * Daarmee omgaan is nog TODO
   * voorgaande goedgekeurde agenda's mogen hier niet aangepast worden (er moet geen data worden teruggezet in dit geval)
   */
  async closeAgenda() {
    const isClosable = await this.currentAgenda.get('isClosable');
    if (isClosable) {
      this.set('isClosingAgenda', true);
      const agendas = await this.get('agendas');
      const designAgenda = agendas
        .filter((agenda) => agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');
      const lastAgenda = agendas
        .filter((agenda) => !agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');

      if (lastAgenda) {
        const session = await lastAgenda.get('createdFor');
        session.set('isFinal', true);
        session.set('agenda', lastAgenda);

        await session.save();
        const closed = await this.store.findRecord('agendastatus', CONFIG.agendaStatusClosed.id); // Async call
        lastAgenda.set('status', closed);
        await lastAgenda.save();
      }

      if (designAgenda) {
        await this.deleteAgenda(designAgenda);
      }
      if (!this.isDestroyed) {
        this.set('isClosingAgenda', false);
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
        const isEditor = this.currentSessionService.isEditor;
        await reorderAgendaitemsOnAgenda(this.currentAgenda, isEditor);
      }
      this.set('showCloseWarning', false);
      this.currentAgenda.set('isApproved', true);
      const isClosable = await this.currentAgenda.get('isClosable');
      if (isClosable) {
        const agendaitems = await this.currentAgenda.get('agendaitems').toArray();
        if (agendaitems.length > 0) {
          this.set('showApproveAndCloseWarning', true);
        } else {
          this.set('isShowingWarningOnClose', true);
        }
      }
    },

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
      this.set('showWarningForApprovingAgenda', false);
      this.set('releasingDecisions', false);
      this.set('releasingDocuments', false);
      this.set('isApprovingAllAgendaitems', false);
    },

    verify() {
      this.set('showWarningForApprovingAgenda', false);
    },

    async approveAgendaAction(session) {
      const isApprovable = await this.currentAgenda.get('isApprovable');
      if (!isApprovable) {
        this.set('showWarningForApprovingAgenda', true);
      } else {
        await this.approveAgenda(session);
      }
    },

    async doApproveAgenda(session) {
      set(this, 'showWarningForApprovingAgenda', false);
      await this.approveAgenda(session);
    },

    async approveAndCloseAgenda() {
      const session = this.get('currentSession');
      const isClosable = await this.currentAgenda.get('isClosable');
      if (isClosable) {
        const meetingOfAgenda = await this.currentAgenda.get('createdFor');
        if (meetingOfAgenda) {
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
          this.set('showApproveAndCloseWarning', false);
          this.set('showCloseWarning', true);
        }
      } else {
        this.set('showCloseWarning', true);
      }
    },

    cancelLockAgenda() {
      this.set('showCloseWarning', false);
    },
    cancelCloseAgenda() {
      if (this.isShowingWarningOnClose) {
        this.set('isShowingWarningOnClose', false);
      }
      if (this.showApproveAndCloseWarning) {
        this.set('showApproveAndCloseWarning', false);
      }
    },

    async approveAndLockAgendaAction() {
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
    /**
     * confirmCloseAgenda
     *
     * Deze actie gaat de huidige zitting afsluiten. Als er een ontwerpagenda is zal deze verwijderd worden.
     * De laatst goedgekeurde agenda wordt genomen als finale agenda in deze zitting.
     * Agendaitems die nieuw waren op deze ontwerpagenda moeten terug agendeerbaar worden (gebeurd in service)
     * Agendaitems die aanpassingen hebben gekregen (nieuwe docs, andere ministers) gaan verloren door verwijdering, echter bestaan die changes nog op procedurestap
     * Daarmee omgaan is nog TODO
     * voorgaande goedgekeurde agenda's mogen hier niet aangepast worden (er moet geen data worden teruggezet in dit geval)
     */
    async confirmCloseAgenda() {
      const isClosable = await this.currentAgenda.get('isClosable');
      const isApproved = await this.currentAgenda.get('isApproved');
      if (isClosable) {
        // All agendaitems are formallyOk
        if (isApproved) {
          // last agenda is approved
          console.log('confirmCloseAgenda isapproved true'); // A, B, alles ok, afsluiten (manueel agenda verwijderd)
          this.set('isShowingWarningOnClose', true);  // confirm close agenda
        } else {
          // last agenda is design (or closed)
          console.log('confirmCloseAgenda isapproved false');  // A, Bo, alles formeel ok, afsluiten
          this.set('showCloseWarning', true); // confirm delete designagenda
        }
      } else {
        console.log('confirmCloseAgenda isClosable false'); // A, Bo, iets nog niet formeel ok, afsluiten
        this.set('showCloseWarning', true);  // warning formal not ok
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

    async deleteAgendaAction() {
      this.set('isDeletingAgenda', true);
      await this.deleteAgenda(this.currentAgenda);
      if (!this.isDestroyed) {
        this.set('isDeletingAgenda', false);
      }
    },

    async createNewDesignAgendaAction() {
      await this.createDesignAgenda();
    },
    async reopenPreviousAgendaAndDeleteCurrentAction() {
      this.set('showConfirmDeleteCurrentAgenda', false);
      this.set('showConfirmReopenPreviousAgenda', false);
      this.set('showLoader', true);
      const agendas = await this.get('agendas');
      const designAgenda = agendas
        .filter((agenda) => agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');

      const lastAgenda = agendas
        .filter((agenda) => !agenda.get('isDesignAgenda'))
        .sortBy('serialnumber')
        .reverse()
        .get('firstObject');

      const session = await lastAgenda.get('createdFor');
      session.set('agenda', lastAgenda);

      await session.save();
      const designAgendaStatus = await this.store.findRecord('agendastatus', CONFIG.agendaStatusDesignAgenda.id); // Async call
      lastAgenda.set('status', designAgendaStatus);
      await lastAgenda.save();

      if (designAgenda) {
        await this.deleteAgenda(designAgenda);
      }

      if (!this.isDestroyed) {
        this.set('isClosingAgenda', false);
      }
      this.set('showLoader', false);
    },
    confirmReopenActionStepDeleteAgenda() {
      this.set('showConfirmDeleteCurrentAgenda', true);
    },
    cancelConfirmReopenActionStepDeleteAgenda() {
      this.set('showConfirmDeleteCurrentAgenda', false);
    },
    cancelConfirmReopenActionStepReopenPreviousAgenda() {
      this.set('showConfirmReopenPreviousAgenda', false);
    },
    confirmReopenActionStepReopenPreviousAgenda() {
      this.set('showConfirmDeleteCurrentAgenda', false);
      this.set('showConfirmReopenPreviousAgenda', true);
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

    // KAS-2194 new actions
    async openConfirmApproveAgenda() {
      // Check if any items are formally NOT ok or NOT YET ok
      // const agendaitemsFormallyNotOk = await this.currentAgenda.get('agendaitemsFormallyNotOk');
      // const agendaitemsFormallyNotYetOk = await this.currentAgenda.get('agendaitemsFormallyNotYetOk');

      this.set('showConfirmForApprovingAgenda', true);

      // open a confirmation model, showing a message based on the previous check with consequences
      // verify triggers the code that will complete the action
      // await this.approveAgenda(session);
    },

    async confirmApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
      await this.approveCurrentAgenda();
    },

    cancelApproveAgenda() {
      this.set('showConfirmForApprovingAgenda', false);
    },

  },

  changeLoading() {
    this.loading();
  },

  // This is outside of actions, move to local methods

  /**
   * ApproveAgenda
   *
   * This method is going to send the current design agenda to the agenda service for approval
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems on that agenda have to be resorted (do this in service ?)
   * - For items that have been on previous approved agendas (and not formally ok now), we have to move the changes made to the new agenda
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * This should best be done in the approve service, because we want all triples copied.
   *
   * @returns
   */
  async approveAgenda() {
    const session = this.get('currentSession');
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
          const isEditor = this.currentSessionService.isEditor;

          // Oude agenda die we gaan afsluiten
          const agendaitems = await agendaToLock.get('agendaitems');
          const agendaitemsWithStatusDifferentFromFormallyOk = agendaitems.filter((agendaitem) => agendaitem.get('isAdded') && (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
          await this.reloadAgendaitemsOfSubcases(agendaitems);
          await this.destroyAgendaitemsList(agendaitemsWithStatusDifferentFromFormallyOk);
          await reorderAgendaitemsOnAgenda(agendaToLock, isEditor);

          // Sort removed agendaitems at bottom of new agenda
          const agendaitemsFromNewAgenda = await newAgenda.get('agendaitems');
          const agendaitemsWithStatusDifferentFromFormallyOkFromNewAgenda = agendaitemsFromNewAgenda.filter((agendaitem) => agendaitem.get('isAdded') && (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
          agendaitemsWithStatusDifferentFromFormallyOkFromNewAgenda.forEach((agendaitem) => {
            agendaitem.set('priority', agendaitem.get('priority') + 9999);
          });
          await reorderAgendaitemsOnAgenda(newAgenda, isEditor);
          return newAgenda;
        })
        .then((newAgenda) => {
          if (this.onApproveAgenda) {
            this.set('sessionService.selectedAgendaitem', null);
            this.changeLoading();
            this.set('isApprovingAgenda', false);
            this.onApproveAgenda(newAgenda.get('id'));
          }
        });
    });
  },


  // KAS-2194  new local stuff

  showConfirmForApprovingAgenda: false,

  /**
   * approveCurrentAgenda
   *
   * This method is going to send the current design agenda to the agenda service for approval
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems on that agenda have to be resorted (do this in service ?)
   * - For items that have been on previous approved agendas (and not formally ok now), we have to move the changes made to the new agenda
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * This should best be done in the approve service, because we want all triples copied.
   *
   * @returns
   */
  async approveCurrentAgenda() {
    const session = this.get('currentSession');
    if (this.get('isApprovingAgenda')) {
      return; // why do we need this? can you approve another agenda while approving ?
    }
    this.set('isApprovingAgenda', true);
    this.changeLoading();
    const agendas = await this.get('agendas');
    let currentDesignAgenda = await agendas.find((agenda) => agenda.get('isDesignAgenda'));
    if (currentDesignAgenda) {
      // reload: true ?
      currentDesignAgenda = await this.store.findRecord('agenda', currentDesignAgenda.get('id'));
    }

    currentDesignAgenda.set(
      'modified',
      moment()
        .utc()
        .toDate()
    );
    currentDesignAgenda.save().then((agendaToApprove) => {
      this.get('agendaService')
        .approveAgendaAndCopyToDesignAgenda(session, agendaToApprove)
        .then(async(newAgenda) => {
          const isEditor = this.currentSessionService.isEditor;
          // KAS-2194 New agenda: new agendaitems that have been moved must be resorted to the bottom of the lists  DONE
          // KAS-2194 old agenda: rollback formally NOT / not yet ok items  && remove new formaly NOT / not yet ok items

          // Old agenda: new agendaitems that have been moved to the new agenda must be removed from the old agenda
          const agendaitemsFromOldAgenda = await currentDesignAgenda.get('agendaitems');
          const agendaitemsToMove = A([]);
          const agendaitemsToRollback = A([]);
          const agendaitemsWithStatusDifferentFromFormallyOk = agendaitemsFromOldAgenda.filter((agendaitem) => (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
          for (agendaitem of agendaitemsWithStatusDifferentFromFormallyOk) {
            const previousVersion = await agendaitem.get('previousVersion');
            if (previousVersion) {
              agendaitemsToRollback.pushObject(agendaitem);
            } else {
              agendaitemsToMove.pushObject(agendaitem);
            }
          }
          await this.reloadAgendaitemsOfSubcases(agendaitemsFromOldAgenda);
          await this.destroyAgendaitemsList(agendaitemsToMove);
          await reorderAgendaitemsOnAgenda(currentDesignAgenda, isEditor);

          // Old agenda: already approved agendaitems that were not formally ok will be rolled back to the previous version
          await this.agendaService.rollbackAgendaitemsNotFormallyOk(currentDesignAgenda);
          for (agendaitem of agendaitemsToRollback) {
            await agendaitem.reload();
            // Do we need to reload everything, possible side effects? we could check if a value was present, and only reload those.
            await agendaitem.hasMany('pieces').reload();
            await agendaitem.hasMany('treatments').reload();
            await agendaitem.hasMany('mandatees').reload();
            await agendaitem.hasMany('approvals').reload();
            await agendaitem.hasMany('linkedPieces').reload();
          }

          // New agenda: new agendaitems that have been moved must be resorted to the bottom of the lists on new agenda
          const agendaitemsFromNewAgenda = await newAgenda.get('agendaitems');
          const newagendaitemsToReorder = A([]);
          const newAgendaitemsWithStatusDifferentFromFormallyOk = agendaitemsFromNewAgenda.filter((agendaitem) => (agendaitem.get('formallyOk') === CONFIG.notYetFormallyOk || agendaitem.get('formallyOk') === CONFIG.formallyNok));
          for (agendaitem of newAgendaitemsWithStatusDifferentFromFormallyOk) {
            const previousVersion = await agendaitem.get('previousVersion');
            if (!previousVersion) {
              newagendaitemsToReorder.pushObject(agendaitem);
            }
          }
          newagendaitemsToReorder.forEach((agendaitem) => {
            agendaitem.set('priority', agendaitem.get('priority') + 9999);
          });

          await reorderAgendaitemsOnAgenda(newAgenda, isEditor);
          return newAgenda;
        })
        .then((newAgenda) => {
          if (this.onApproveAgenda) {
            this.set('sessionService.selectedAgendaitem', null);
            this.changeLoading();
            this.set('isApprovingAgenda', false);
            this.onApproveAgenda(newAgenda.get('id'));
          }
        });
    });
  },
});
