import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(isAuthenticatedMixin, {
	sessionService: inject(),
	queryParams: ['selectedAgenda'],
	selectedAgenda: null,
	creatingNewSession: false,
	selectedAnnouncement: null,
	createAnnouncement: false,
	isLoading: false,
	isPrintingDecisions: false,
	
	currentSession: alias('sessionService.currentSession'),
	agendas: alias('sessionService.agendas'),
	announcements: alias('sessionService.announcements'),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentAgendaItems: alias('sessionService.currentAgendaItems'),

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
			this.transitionToRoute('print-overviews.notes.overview', currentSessionId, {queryParams: {selectedAgenda_id: currentAgendaId}} )
		},

		navigateToDecisions(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.decisions.overview', currentSessionId, {queryParams: {selectedAgenda_id: currentAgendaId}} )
		},

		navigateToPressAgenda(currentSessionId, currentAgendaId) {
			this.transitionToRoute('print-overviews.press-agenda.overview', currentSessionId, {queryParams: {selectedAgenda_id: currentAgendaId}} )
		},

		navigateToSubCases() {
			this.transitionToRoute('subcases');
		},

		reloadRouteWithNewAgenda(selectedAgendaId) {
			const { currentSession } = this;
			this.transitionToRoute('agenda.agendaitems', currentSession.id, { queryParams: { selectedAgenda: selectedAgendaId } });
			this.send('refresh');
		},

		navigateToNewAnnouncement(announcement) {
			this.set("createAnnouncement", false);
			// this.set("selectedAgendaItem", null);
			this.set("selectedAnnouncement", announcement);
		},

		navigateToCreateAnnouncement() {
			this.set("createAnnouncement", true);
			// this.set("selectedAgendaItem", null);
			this.set("selectedAnnouncement", null);
		},

		// selectAnnouncement(announcement) {
		// 	this.set("createAnnouncement", false);
		// 	this.set("selectedAgendaItem", null);
		// 	this.set("selectedAnnouncement", announcement);
		// },

		compareAgendas() {
			this.transitionToRoute('comparison');
		},

		loadingAgendaitems() {
			this.toggleProperty('isLoading');
		}
	}
});
