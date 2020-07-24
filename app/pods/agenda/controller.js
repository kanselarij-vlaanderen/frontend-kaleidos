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

  currentAgendaItems: alias('sessionService.currentAgendaItems'),

  actions: {
    selectAgenda(agenda) {
      this.set('sessionService.selectedAgendaItem', null);
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, agenda.get('id'));
    },

    navigateToOverview() {
      this.set('sessionService.selectedAgendaItem', null);
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, this.model.agenda.id);
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
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, selectedAgendaId);
    },

    reloadRouteWithNewAgendaitem(newAgendaitemId) {
      this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, this.model.agenda.id, {
        queryParams: {
          refresh: newAgendaitemId,
        },
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
    },
  },
});
