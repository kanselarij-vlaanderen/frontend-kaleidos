import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';

export default Component.extend({
	sessionService:inject(),
	classNames:"vlc-agenda-items",
	classNameBindings: ['getClassNames'],
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	agendaitems:null,

	spacerClass: computed('agendaitemGroups', function() {
		const { agendaitemGroups } = this;
		if(agendaitemGroups && agendaitemGroups.get('firstObject').length > 1) {
			return 'u-spacer--large';
		}
	}),

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
