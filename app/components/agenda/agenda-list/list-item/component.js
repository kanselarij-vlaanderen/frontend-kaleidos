import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["agenda-item-container"],
	tagName: "div",
	selectedAgendaItem: null,
	index:null,

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	}),

	actions: {
		selectAgendaItem(agendaitem) {
			this.set('selectedAgendaItem', agendaitem);
		},
	}
});
