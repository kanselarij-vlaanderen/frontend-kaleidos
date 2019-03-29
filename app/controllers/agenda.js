import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
// import { computed } from '@ember/object';

export default Controller.extend({
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

		async printDecisions() {
			const isPrintingDecisions = this.get('isPrintingDecisions');

			if (!isPrintingDecisions) {
				const currentAgendaitems = await this.get('currentAgendaItems');
				let decisions = await Promise.all(currentAgendaitems.map(async item => {
					return await this.store.peekRecord('agendaitem', item.id).get('decision');
				}));
				decisions = decisions.filter(item => !!item);
				this.set('printedDecisions', decisions);
			}

			this.toggleProperty('isPrintingDecisions');
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
