import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		return this.store.query('session', {
			filter: {
				':gt:plannedstart': "",
			},
			sort: "number",
			refresh: true
		});
	},

	actions: {
		refresh() {
			this.refresh();
		}
	}
});
