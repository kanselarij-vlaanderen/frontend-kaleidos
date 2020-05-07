import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed, observer, get } from '@ember/object';

export default Controller.extend(isAuthenticatedMixin, {
  sessionService: inject(),
  agendaService: inject(),
  router: inject(),
  isLoading: false,

  selectedAgendaObserver: observer('this.model.agenda', async function () {
    this.set('agendaService.addedAgendaitems', []);
    this.set('agendaService.addedDocuments', []);

    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(this.model.meeting, this.model.agenda); // Should soon be accesible through a relation on the agenda model
    if (previousAgenda && this.model.meeting && this.model.agenda) {
      await this.agendaService.agendaWithChanges(this.model.agenda.get('id'), previousAgenda.get('id'));
    }
  }),

  shouldHideNav: computed('router.currentRouteName', function () {
    return this.get('router.currentRouteName') === 'agenda.compare';
  }),

  showPrintButton: computed('router.currentRouteName', function () {
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
