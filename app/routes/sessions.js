import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let date = new Date();
		date.setHours(0, 0, 0, 0);
		return this.store.query('session', {
			filter: {
				':gt:plannedstart': "",
				':gte:plannedstart': date.toISOString()
			},
			sort: "number"
		});
	},

	afterModel(model) {
		let session = model.get('firstObject');
		if(session && session.id) {
		this.transitionTo('sessions.session', session.id);
		}
	}

});
