import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let session = this.modelFor('sessions.session');
		return session.get('agendas');
	},
	redirect(model) {
			this.transitionTo('sessions.session.agendas.agenda', model.get('firstObject').id);
	}
});
