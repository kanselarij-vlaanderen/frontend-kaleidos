import Controller from '@ember/controller';

export default Controller.extend({
	actions: {
		navigateToSubCases() {
			this.transitionToRoute('sessions.session.agendas.agenda.subcases');
		},
	}
});
