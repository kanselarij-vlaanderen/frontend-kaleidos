import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
	sessionService: inject(),
	creatingNewSession: false,
	selectedAgendaItem: null,
	createAnnouncement: false,
	isLoading:false,
	currentSession: alias('sessionService.currentSession'),
	agendas: alias('sessionService.agendas'),
  announcements: alias('sessionService.announcements'),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentAgendaItems: alias('sessionService.currentAgendaItems'),

	agendaitemsClass: computed('selectedAgendaItem', function() {
		if(this.get('selectedAgendaItem')) {
			return "vlc-panel-layout__agenda-items vl-u-bg-porcelain";
		} else {
			return "vl-u-bg-porcelain";
		}
	}),

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
		},

		loadingAgendaitems() {
			this.toggleProperty('isLoading');
		}
	}
});
