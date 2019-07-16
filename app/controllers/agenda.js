import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Controller.extend(isAuthenticatedMixin, {
	sessionService: inject(),
	router: inject(),
	queryParams: ['selectedAgenda'],
	selectedAgenda: null,
	creatingNewSession: false,
	selectedAnnouncement: null,
	createAnnouncement: false,
	isLoading: false,
	isPrintingDecisions: false,
	
	shouldHideNav:computed('router.currentRouteName', function() {
		return this.get('router.currentRouteName') === "agenda.compare";
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
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	},

	actions: {
		selectAgenda(agenda) {
			const { currentSession } = this;
			this.set('sessionService.selectedAgendaItem', null);
			this.transitionToRoute('agenda.agendaitems', currentSession.id, { queryParams: { selectedAgenda: agenda.id } });
		},

		navigateToOverview() {
			this.set('sessionService.selectedAgendaItem', null);
			const { currentSession } = this;
			this.transitionToRoute('agenda.agendaitems', currentSession.id, { queryParams: { selectedAgenda: this.get('sessionService.currentAgenda').id } });
		},

		navigateToNotes(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.notes.agendaitems', currentSessionId, currentAgendaId)
		},

		navigateToDecisions(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.decisions.agendaitems', currentSessionId, currentAgendaId)
		},

		navigateToPressAgenda(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.press-agenda.agendaitems', currentSessionId, currentAgendaId)
		},

		navigateToNewsletter(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.newsletter.agendaitems', currentSessionId, currentAgendaId)
		},

		navigateToSubCases() {
			this.transitionToRoute('subcases');
		},

		reloadRouteWithNewAgenda(selectedAgendaId) {
			const { currentSession } = this;
			this.transitionToRoute('agenda.agendaitems', currentSession.id, { queryParams: { selectedAgenda: selectedAgendaId, refresh: this.create_UUID() } })
		},

		compareAgendas() {
			this.transitionToRoute('agenda.compare');
		},

		loadingAgendaitems() {
			this.toggleProperty('isLoading');
		}
	}
});
