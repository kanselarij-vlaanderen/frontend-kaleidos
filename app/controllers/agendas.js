import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
	sessionService: inject(),
	creatingNewSession: false,
	selectedAgendaItem: null,
  selectedAnnouncement: null,
	createAnnouncement: false,
	isLoading: false,
	currentSession: alias('sessionService.currentSession'),
	agendas: alias('sessionService.agendas'),
	announcements: alias('sessionService.announcements'),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentAgendaItems: alias('sessionService.currentAgendaItems'),

	agendaitemsClass: computed('selectedAgendaItem', 'selectedAnnouncement', 'createAnnouncement', function() {
		if(this.get('selectedAgendaItem') || this.get('selectedAnnouncement') || this.get('createAnnouncement')) {
			return "vlc-panel-layout__agenda-items vl-u-bg-porcelain";
		} else {
			return "vlc-panel-layout-agenda__detail vl-u-bg-porcelain";
		}
	}),

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('subcases');
		},

    navigateToNewAnnouncement(announcement) {
      this.set("createAnnouncement", false);
      this.set("selectedAgendaItem", null);
      this.set("selectedAnnouncement", announcement);
		},

    navigateToCreateAnnouncement() {
			this.set("createAnnouncement", true);
      this.set("selectedAgendaItem", null);
			this.set("selectedAnnouncement", null);
		},

    selectAgendaItem(agendaitem) {
      this.set("createAnnouncement", false);
      this.set("selectedAgendaItem", agendaitem);
      this.set("selectedAnnouncement", null);
		},

    selectAnnouncement(announcement) {
      this.set("createAnnouncement", false);
      this.set("selectedAgendaItem", null);
      this.set("selectedAnnouncement", announcement);
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
