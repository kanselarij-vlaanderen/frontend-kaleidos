import Route from '@ember/routing/route';

export default Route.extend({

	model(params) {
		return this.store.findRecord('agendaitem', params.agendaitemid, {
			filter: {
				include: ['subcase', 'decision', 'comments', 'news-item']
			},
		})
	}
});
