import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
	classNames:"vlc-agenda-items",
	classNameBindings: ['getClassNames'],
	selectedAgendaItem: null,
	agendaitems:null,

	getClassNames: computed('selectedAgendaItem', function() {
		if(this.get('selectedAgendaItem')) {
			return "vlc-agenda-items vlc-agenda-items--small";
		} else {
			return "vlc-agenda-items";
		}
	}),

	actions: {
		selectAgendaItem(agendaitem) {
			this.selectAgendaItem(agendaitem);
		}
	}
});
