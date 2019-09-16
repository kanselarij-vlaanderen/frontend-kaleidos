import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias, filter } from '@ember/object/computed';
import { computed } from '@ember/object';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, FileSaverMixin, {
  classNames: ['vlc-page-header'],

  store: inject(),
  sessionService: inject(),
  agendaService: inject(),
  fileService: inject(),
  router: inject(),


  isShowingOptions: false,
  isPrintingNotes: false,
  isAddingAnnouncement: false,
  isAddingAgendaitems: false,

  currentAgendaItems: alias('sessionService.currentAgendaItems'),
  currentSession: alias('sessionService.currentSession'),
  currentAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  definiteAgendas: alias('sessionService.definiteAgendas'),

  hasMultipleAgendas: computed('agendas.@each',async function() {
    return this.agendas && this.agendas.then(agendas => agendas.length > 1);
  }),

  designAgendaPresent: filter('currentSession.agendas.@each.name', function(agenda) {
    return agenda.get('name') === 'Ontwerpagenda';
  }),

  async createDesignAgenda() {
    this.changeLoading();
    const session = this.get('currentSession');
    session.set('isFinal', false);
    session.save();
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

  actions: {
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

    async approveAgenda(session) {
      const isApprovable = await this.currentAgenda.get('isApprovable');
      if (!isApprovable) {
        this.set('showWarning', true);
      } else {
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
              await Promise.all(newNotYetOKItems.map(newNotYetOK => newNotYetOK.destroyRecord()));
              return newAgenda;
            })
            .then((newAgenda) => {
              this.changeLoading();
              this.get('agendaService').sortAgendaItems(newAgenda);
              this.get('agendaService').sortAgendaItems(agendaToLock);
              this.set('sessionService.currentAgenda', newAgenda);
              this.set('sessionService.selectedAgendaItem', null);
              this.reloadRoute(newAgenda.get('id'));
            });
        });
      }
    },

    async lockAgenda() {
      const agendas = await this.get('agendas');
      const draft = agendas
        .filter((agenda) => agenda.name === 'Ontwerpagenda')
        .sortBy('-name')
        .get('firstObject');
      const lastAgenda = agendas
        .filter((agenda) => agenda.name !== 'Ontwerpagenda')
        .sortBy('-name')
        .get('firstObject');

      if (draft) {
        await draft.destroyRecord();

        const session = await lastAgenda.get('createdFor');
        session.set('isFinal', true);
        await session.save();
        this.set('sessionService.currentAgenda', lastAgenda);
        this.reloadRoute();
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
      const date = moment(this.currentSession.get('plannedStart'))
        .format('DD_MM_YYYY')
        .toString();
      const files = await this.fileService.getAllDocumentsFromAgenda(this.currentAgenda.get('id'));
      const file = await this.fileService.getZippedFiles(date, this.currentAgenda, files);
      return this.saveFileAs(
        `${this.currentAgenda.get('agendaName')}_${date}.zip`,
        file,
        'application/zip'
      );
    },

    async deleteDesignAgenda(agenda) {
      const definiteAgendas = await this.get('definiteAgendas');
      const lastDefiniteAgenda = await definiteAgendas.get('firstObject');

      agenda.destroyRecord().then(() =>
        lastDefiniteAgenda
          ? this.set('sessionService.currentAgenda', lastDefiniteAgenda || null)
          : this.currentSession.destroyRecord().then(() => this.router.transitionTo('agendas'))
      );
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
    }
  },

  changeLoading() {
    this.loading();
  },

  reloadRoute(id) {
    this.reloadRouteWithNewAgenda(id);
  },
});
