import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
	sessionService: inject(),
	classNames: ['vlc-side-nav'],

	// classNameBindings: ['agendaMenuOpened:vl-layout-agenda__sidebar--collapsed'],
	agendaMenuOpened:false,
	
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
			this.selectAgenda(agenda);
		}
	},
});
