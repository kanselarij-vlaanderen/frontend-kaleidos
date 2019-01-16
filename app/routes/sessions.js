import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let date = new Date();
		date.setHours(0,0,0,0);
		return this.store.query('session', {
			filter: {
				':gte:plannedstart': date.toISOString()
			}
		});
	}
});
