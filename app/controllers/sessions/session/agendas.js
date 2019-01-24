import Controller from '@ember/controller';

export default Controller.extend({
	agendaMenuOpened: true,

	actions: {
		compareAgendas() {
			this.transitionToRoute('sessions.session.comparison');
		},

		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		}
	}
});
