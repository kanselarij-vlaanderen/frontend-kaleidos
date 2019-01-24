import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		return this.store.findRecord('session', params.id, {reload:true});
	},

	redirect() {
		this.transitionTo('sessions.session.agendas');
}
});
