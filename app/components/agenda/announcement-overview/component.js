import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
	classNames: ["vlc-panel-layout__main-content"],
	currentAgenda: alias('sessionService.currentAgenda'),
	sessionService: inject(),
	store: inject(),
	currentAgendaItem: null,
  isEditing: false,

	lastDefiniteAgenda: computed('sessionService.definiteAgendas.firstObject', async function () {
		const definiteAgendas = await this.get('sessionService.definiteAgendas');
		return definiteAgendas.get('lastObject');
	}),

	actions: {

    save (announcement){

    },
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

		deleteAnnouncement(announcement) {
      announcement.destroyRecord().then(() => {
				this.set('announcement', null);
			});
		},

	}
});
