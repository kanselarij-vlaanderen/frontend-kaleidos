import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	tagName:'ul',
	classNames: ['vlc-view-switch'],

	selectedAgendaitemClass: computed('selectedAgendaItem', function() {
		if(this.get('selectedAgendaItem')) {
			return "vlc-view-switch__item--active";
		}	
	}),

	selectedOverviewClass: computed('selectedAgendaItem', function() {
		if(!this.get('selectedAgendaItem')) {
			return "vlc-view-switch__item--active";
		}	
	}),


	actions: {
		compareAgendas() {
			this.compareAgendas();
		},

		clearSelectedItem() {
			this.clearSelectedAgendaItem();
		}
	}
});
