import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let date = new Date();
		date.setHours(0, 0, 0, 0);

		return this.store.query('session', {
			filter: {
				':gte:plannedstart': date.toISOString()
			}
		});
	},

	afterModel(model) {
		let session = model.get('firstObject');
		this.transitionTo('sessions.session', session.id);
	}

});
