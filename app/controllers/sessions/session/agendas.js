import Controller from '@ember/controller';

export default Controller.extend({
	agendaMenuOpened: true,

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('sessions.session.agendas.agenda.subcases');
		},

		compareAgendas() {
			this.transitionToRoute('sessions.session.comparison');
		},

		collapseSideMenu() {
			this.set('agendaMenuOpened', !this.get('agendaMenuOpened'));
		}
	}
});
