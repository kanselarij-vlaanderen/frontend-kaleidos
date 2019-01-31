import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
	sessionService: inject(),
	classNames: ['side--menu-container'],
	classNameBindings: ['agendaMenuOpened:opened'],

	selectedAgendaItem:null,
	agendaMenuOpened:true,
	
	currentAgenda: alias('sessionService.currentAgenda'),
	currentSession: alias('sessionService.currentSession'),

	actions: {
		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		},

		compareAgendas() {
			this.compareAgendas();
		},

		setCurrentAgenda(agenda) {
			this.set('selectedAgendaItem', null);
			this.set('sessionService.currentAgenda', agenda);
		}
	},
});
