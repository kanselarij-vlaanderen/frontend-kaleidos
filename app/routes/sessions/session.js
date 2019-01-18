import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		return this.store.findRecord('session', params.id);
	},

	async afterModel(model) {
		let agendas = await model.agendas;
		let agenda = agendas.get('firstObject');
		this.transitionTo('sessions.session.agendas.agenda', agenda.id);
}
});
