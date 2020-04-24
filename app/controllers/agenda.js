import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, observer, get } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
  sessionService: inject(),
  agendaService: inject(),
  router: inject(),
  intl: inject(),
  currentSession: inject(),
  queryParams: ['selectedAgenda'],
  selectedAgenda: null,
  creatingNewSession: false,
  selectedAnnouncement: null,
  createAnnouncement: false,
  isLoading: false,
  isPrintingDecisions: false,

  selectedAgendaObserver: observer('selectedAgenda', async function () {
    const session = await this.get('sessionService.currentSession');
    const agenda = await this.get('sessionService.currentAgenda');

    this.set('agendaService.addedAgendaitems', []);
    this.set('agendaService.addedDocuments', []);

    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(session, agenda);
    if (previousAgenda && session && agenda) {
      await this.agendaService.agendaWithChanges(agenda.get('id'), previousAgenda.get('id'));
    }
  }),

  documentTitle: computed('currentAgenda', 'currentSession', function () {
    const { currentSession, currentAgenda } = this;
    const agendaName = currentAgenda ? currentAgenda.get('agendaName') : '';
    const dateToDisplay = moment(currentSession.get('plannedStart')).format('DD/MM/YYYY HH:mm');
    return `${agendaName} van ${dateToDisplay}`;
  }),

  shouldHideNav: computed('router.currentRouteName', function () {
    return this.get('router.currentRouteName') === 'agenda.compare';
  }),

  showPrintButton: computed('router.currentRouteName', function () {
    return get(this, 'router.currentRouteName') === 'agenda.print';
  }),

  currentSession: alias('sessionService.currentSession'),
  agendas: alias('sessionService.agendas'),
  announcements: alias('sessionService.announcements'),
  currentAgenda: alias('sessionService.currentAgenda'),
  currentAgendaItems: alias('sessionService.currentAgendaItems'),

  create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  },

  actions: {
    selectAgenda(agenda) {
      const { currentSession } = this;
      this.set('sessionService.selectedAgendaItem', null);
      this.transitionToRoute('agenda.agendaitems', currentSession.id, {
        queryParams: { selectedAgenda: agenda.get('id') }
      });
    },

    navigateToOverview() {
      this.set('sessionService.selectedAgendaItem', null);
      const { currentSession } = this;
      this.transitionToRoute('agenda.agendaitems', currentSession.id, {
        queryParams: { selectedAgenda: this.get('sessionService.currentAgenda').id }
      });
    },

    navigateToNotes(currentSessionId, currentAgendaId) {
      this.transitionToRoute(
        'print-overviews.notes.agendaitems',
        currentSessionId,
        currentAgendaId
      );
    },

    navigateToDecisions(currentSessionId, currentAgendaId) {
      this.transitionToRoute(
        'print-overviews.decisions.agendaitems',
        currentSessionId,
        currentAgendaId
      );
    },

    navigateToPressAgenda(currentSessionId, currentAgendaId) {
      this.transitionToRoute(
        'print-overviews.press-agenda.agendaitems',
        currentSessionId,
        currentAgendaId
      );
    },

    navigateToNewsletter(currentSessionId, currentAgendaId) {
      this.transitionToRoute(
        'print-overviews.newsletter.agendaitems',
        currentSessionId,
        currentAgendaId
      );
    },

    navigateToSubCases() {
      this.transitionToRoute('subcases');
    },

    reloadRouteWithNewAgenda(selectedAgendaId) {
      const { currentSession } = this;
      this.transitionToRoute('agenda.agendaitems', currentSession.id, {
        queryParams: { selectedAgenda: selectedAgendaId, refresh: this.create_UUID() }
      });
    },

    compareAgendas() {
      this.transitionToRoute('agenda.compare');
    },

    navigateToDocuments() {
      this.transitionToRoute('agenda.documents');
    },

    loadingAgendaitems() {
      this.toggleProperty('isLoading');
    }
  }
});
