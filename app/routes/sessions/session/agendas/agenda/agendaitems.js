import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let agenda = this.modelFor('sessions.session.agendas.agenda');
		return agenda.agendaitems;
	}
});
