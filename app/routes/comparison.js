import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		return this.store.query('agenda', {
			filter: {
				session: { id: params.sessionid }
			},
			sort: '-name'
		})
	}
});
