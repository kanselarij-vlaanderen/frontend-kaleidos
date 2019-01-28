import Component from '@ember/component';

export default Component.extend({
	classNames: ['side--menu-container'],
	classNameBindings: ['agendaMenuOpened:opened'],

	actions: {
		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		},

		compareAgendas() {
			this.transitionToRoute('comparison', this.get('currentSession').id);
		},

		setCurrentAgenda(agenda) {
			this.set('currentAgenda', agenda);
		}
	}
});
