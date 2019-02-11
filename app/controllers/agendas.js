import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
	sessionService: inject(),
	creatingNewSession: false,
	selectedAgendaItem: null,
  createAnnouncement: false,
	currentSession: alias('sessionService.currentSession'),
	agendas: alias('sessionService.agendas'),
  announcements: alias('sessionService.announcements'),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentAgendaItems: alias('sessionService.currentAgendaItems'),

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('subcases');
		},

    navigateToCreateAnnouncement() {
      this.set("createAnnouncement", true);
      this.set("selectedAgendaItem", null);
		},
		
		compareAgendas() {
			this.transitionToRoute('comparison');
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		}
	}
});
