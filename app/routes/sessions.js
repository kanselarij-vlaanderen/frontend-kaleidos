import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		return this.store.query('session', { 
			filter: {
				':gt:plannedstart': "",
			},
			sort: "number"
		}, {			reload:true
		});
	},

	redirect(model) {
		let session = model.get('firstObject');
		if (session && session.id) {
			this.transitionTo('sessions.session', session.id);
		}
	},

	actions: {
		refreshModel: function () {
			this.refresh();
		}
	}
});
