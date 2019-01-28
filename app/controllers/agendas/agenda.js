import Controller from '@ember/controller';

export default Controller.extend({
	actions: {
		navigateToSubCases() {
			this.transitionToRoute('agendas.agenda.subcases');
		},
	}
});
