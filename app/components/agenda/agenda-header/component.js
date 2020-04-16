import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias, filter } from '@ember/object/computed';
import { computed, set } from '@ember/object';
import { warn, debug } from '@ember/debug';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob
} from 'fe-redpencil/utils/zip-agenda-files';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, FileSaverMixin, {
  classNames: ['vlc-page-header'],

  store: service(),
  sessionService: service(),
  agendaService: service(),
  fileService: service(),
  router: service(),
  intl: service(),
  jobMonitor: service(),
  toaster: service(),

  isShowingOptions: false,
  isPrintingNotes: false,
  isAddingAnnouncement: false,
  isAddingAgendaitems: false,
  isApprovingAgenda: false,
  isDeletingAgenda: false,
  isLockingAgenda: false,

  currentAgendaItems: alias('sessionService.currentAgendaItems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  definiteAgendas: alias('sessionService.definiteAgendas'),

  hasMultipleAgendas: computed('agendas.@each', async function () {
    return this.agendas && this.agendas.then(agendas => agendas.length > 1);
  }),

  currentAgendaIsLast: computed('currentSession', 'currentAgenda', 'currentSession.agendas.@each', async function () {
    return await this.currentSession.get('sortedAgendas.firstObject.id') === await this.currentAgenda.get('id');
  }),

  designAgendaPresent: filter('currentSession.agendas.@each.name', function (agenda) {
    return agenda.get('name') === 'Ontwerpagenda';
  }),

  shouldShowLoader: computed('isDeletingAgenda', 'isLockingAgenda', function () {
    return this.isDeletingAgenda || this.isLockingAgenda;
  }),

  loaderText: computed('isDeletingAgenda', 'isLockingAgenda', function () {
    let text = '';
    if (this.isDeletingAgenda) {
      text = this.intl.t('agenda-delete-message');
    }
    if (this.isLockingAgenda) {
      text = this.intl.t('agenda-lock-message');
    }
    return text + ' ' + this.intl.t('please-be-patient');
  }),

  loaderTitle: computed('isDeletingAgenda', 'isLockingAgenda', function () {
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

    this.get('agendaService')
      .approveAgendaAndCopyToDesignAgenda(session, lastDefiniteAgenda)
      .then((newAgenda) => {
        this.changeLoading();
        this.set('sessionService.currentAgenda', newAgenda);
        this.reloadRoute(newAgenda.get('id'));
      });
  },

  async deleteAgenda(agenda) {
    const session = await this.currentSession;
    if (!agenda) {
      //TODO possible dead code, there is always an agenda ?
      return;
    }
    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(session, agenda);
    await this.agendaService.deleteAgenda(agenda);
    if (previousAgenda) {
      await session.save();
      await this.set('sessionService.currentAgenda', previousAgenda);
      this.router.transitionTo('agenda.agendaitems.index', session.id, {
        queryParams: { selectedAgenda: previousAgenda.get('id') }
      });
    } else {
      await this.sessionService.deleteSession(session);
    }
  },

  reloadAgendaitemsOfSubcases(agendaItems) {
    return Promise.all(agendaItems.map(async agendaitem => {
      const subcase = await agendaitem.get('subcase');
      if (subcase) {
        await subcase.hasMany('agendaitems').reload();
      }
      return agendaitem;
    })).catch(() => {
      warn('Something went wrong while reloading the agendaitems of the subcases.', { id: 'subcase-reloading' });
    });
  },

  destroyAgendaitemsList(agendaitems) {
    return Promise.all(agendaitems.map(agendaitem => {
      if (!agendaitem) {
        return;
      }
      return agendaitem.destroyRecord().catch(() => warn('Something went wrong while deleting the agendaitem.', { id: 'agenda-item-reloading' }));
    }));
  },

  actions: {
    print() {
      window.print();
    },

    navigateToNotes() {
      const { currentSession, currentAgenda } = this;
      this.navigateToNotes(currentSession.get('id'), currentAgenda.get('id'));
    },

    navigateToPressAgenda() {
      const { currentSession, currentAgenda } = this;
      this.navigateToPressAgenda(currentSession.get('id'), currentAgenda.get('id'));
    },

    navigateToNewsletter() {
      const { currentSession, currentAgenda } = this;
      this.navigateToNewsletter(currentSession.get('id'), currentAgenda.get('id'));
    },

    navigateToDecisions() {
      const { currentSession, currentAgenda } = this;
      this.navigateToDecisions(currentSession.get('id'), currentAgenda.get('id'));
    },

    clearSelectedAgendaItem() {
      this.clearSelectedAgendaItem();
    },

    cancel() {
      this.set('showWarning', false);
      this.set('releasingDecisions', false);
      this.set('releasingDocuments', false);
    },

    verify() {
      this.set('showWarning', false);
    },

    async tryToApproveAgenda(session) {
      const isApprovable = await this.currentAgenda.get('isApprovable');
      if (!isApprovable) {
        this.set('showWarning', true);
      } else {
        await this.approveAgenda(session)
      }
    },

    async doApproveAgenda(session) {
      set(this, 'showWarning', false);
      await this.approveAgenda(session)
    },

    async lockAgenda() {
      this.set('isLockingAgenda', true);
      const agendas = await this.get('agendas');
      const designAgenda = agendas
        .filter((agenda) => agenda.name === 'Ontwerpagenda')
        .sortBy('-name')
        .get('firstObject');
      const lastAgenda = agendas
        .filter((agenda) => agenda.name !== 'Ontwerpagenda')
        .sortBy('-name')
        .get('firstObject');

      const session = await lastAgenda.get('createdFor');
      session.set('isFinal', true);
      session.set('agenda', lastAgenda);
      await session.save();

      if (designAgenda) {
        await this.deleteAgenda(designAgenda);
      }
      if (!this.isDestroyed) {
        this.set('isLockingAgenda', false);
      }
    },

    async unlockAgenda() {
      await this.createDesignAgenda();
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    compareAgendas() {
      this.compareAgendas();
    },

    navigateToSubCases() {
      this.set('isAddingAgendaitems', true);
    },

    toggleIsAddingAnnouncement() {
      this.toggleProperty('isAddingAnnouncement');
    },

    navigateToCreateAnnouncement() {
      this.set('addingAnnouncement', true);
    },

    navigateToDocuments() {
      this.navigateToDocuments();
    },

    async downloadAllDocuments() {
      const fileDownloadToast = {
        title: this.intl.t('file-ready'),
        type: 'download-file',
        options: { timeOut: 10 * 1000 }
      };

      const namePromise = constructArchiveName(this.currentAgenda);
      debug('Checking if archive exists ...');
      const jobPromise = fetchArchivingJobForAgenda(this.currentAgenda, this.store);
      const [name, job] = await Promise.all([namePromise, jobPromise]);
      if (!job.hasEnded) {
        debug('Archive in creation ...');
        const inCreationToast = this.toaster.loading(this.intl.t('archive-in-creation-message'),
          this.intl.t('archive-in-creation-title'), { timeOut: 3 * 60 * 1000 });
        this.jobMonitor.register(job);
        job.on('didEnd', this, async function (status) {
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

    reloadRoute(id) {
      this.reloadRoute(id);
    },

    selectSignature() {
      this.toggleProperty('isAssigningSignature', false);
    },
    releaseDecisions() {
      this.set('releasingDecisions', true);
    },
    confirmReleaseDecisions() {
      this.set('releasingDecisions', false);
      this.currentSession.set('releasedDecisions', moment().utc().toDate());
      this.currentSession.save();
    },
    releaseDocuments() {
      this.set('releasingDocuments', true);
    },
    confirmReleaseDocuments() {
      this.set('releasingDocuments', false);
      this.currentSession.set('releasedDocuments', moment().utc().toDate());
      this.currentSession.save();
    },
    toggleEditingSession() {
      this.toggleProperty('editingSession')
    },
    successfullyEdited() {
      this.toggleProperty('editingSession')
    },
    cancelEditSessionForm() {
      this.toggleProperty('editingSession')
    }
  },

  changeLoading() {
    this.loading();
  },

  reloadRoute(id) {
    this.reloadRouteWithNewAgenda(id);
  },

  async approveAgenda(session) {
    if (this.get('isApprovingAgenda')) {
      return;
    }
    this.set('isApprovingAgenda', true);
    this.changeLoading();
    let agendas = await this.get('agendas');
    let agendaToLock = await agendas.find((agenda) => agenda.name == 'Ontwerpagenda');
    if (agendaToLock) {
      agendaToLock = await this.store.findRecord('agenda', agendaToLock.get('id'));
    }
    let definiteAgendas = await this.get('definiteAgendas');
    let lastDefiniteAgenda = await definiteAgendas.get('firstObject');

    if (!lastDefiniteAgenda) {
      agendaToLock.set('name', CONFIG.alphabet[0]);
    } else {
      if (definiteAgendas) {
        const agendaLength = definiteAgendas.length;

        if (agendaLength && CONFIG.alphabet[agendaLength]) {
          if (agendaLength < CONFIG.alphabet.get('length') - 1) {
            agendaToLock.set('name', CONFIG.alphabet[agendaLength]);
          }
        } else {
          agendaToLock.set('name', agendaLength + 1);
        }
      } else {
        agendaToLock.set('name', agendas.get('length') + 1);
      }
    }

    agendaToLock.set('isAccepted', true);
    agendaToLock.set(
      'modified',
      moment()
        .utc()
        .toDate()
    );
    agendaToLock.save().then((agendaToApprove) => {
      this.get('agendaService')
        .approveAgendaAndCopyToDesignAgenda(session, agendaToApprove)
        .then(async newAgenda => {
          const agendaItems = await agendaToLock.get('agendaitems');
          const newNotYetOKItems = agendaItems.filter(agendaItem => agendaItem.get('isAdded') && agendaItem.get('formallyOk') === CONFIG.notYetFormallyOk);
          await this.reloadAgendaitemsOfSubcases(agendaItems);
          await this.destroyAgendaitemsList(newNotYetOKItems);
          return newAgenda;
        })
        .then((newAgenda) => {
          this.set('sessionService.currentAgenda', newAgenda);
          this.reloadRoute(newAgenda.get('id'));
        }).finally(() => {
        this.set('sessionService.selectedAgendaItem', null);
        this.changeLoading();
        this.set('isApprovingAgenda', false);
      });
    });
  },
});
