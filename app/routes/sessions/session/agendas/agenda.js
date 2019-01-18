import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let agendas = this.modelFor('sessions.session.agendas');
		return agendas.get('firstObject');
	},
	redirect() {
		this.transitionTo('sessions.session.agendas.agenda.agendaitems');
	}
});
