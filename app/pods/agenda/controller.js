import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import {
  computed, get
} from '@ember/object';

export default Controller.extend({
  sessionService: inject(),
  agendaService: inject(),
  router: inject(),
  currentSession: inject(),
  isLoading: false,

  shouldHideNav: computed('router.currentRouteName', function() {
    return this.get('router.currentRouteName') === 'agenda.compare';
  }),

  showPrintButton: computed('router.currentRouteName', function() {
    return get(this, 'router.currentRouteName') === 'agenda.print';
  }),

  currentAgendaitems: alias('sessionService.currentAgendaitems'),

  actions: {
    selectAgenda(agenda) {
      this.set('sessionService.selectedAgendaitem', null);
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, agenda.get('id'));
    },

    navigateToOverview() {
      this.set('sessionService.selectedAgendaitem', null);
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, this.model.agenda.id);
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

    navigateToNewsletter(currentSessionId) {
      this.transitionToRoute(
        'newsletter',
        currentSessionId
      );
    },

    navigateToAgenda(selectedAgendaId) {
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, selectedAgendaId);
    },

    compareAgendas() {
      this.transitionToRoute('agenda.compare');
    },

    navigateToDocuments() {
      this.transitionToRoute('agenda.documents');
    },

    loadingAgendaitems() {
      this.toggleProperty('isLoading');
    },

    refresh() {
      this.send('reloadModel');
    },
  },
});
