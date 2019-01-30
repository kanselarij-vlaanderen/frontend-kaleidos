import Route from '@ember/routing/route';

export default Route.extend({
	queryParams: {
    sessionId: { refreshModel: true },
    agendaId: { refreshModel: true }
	},
	
	model() {
		return this.store.query('session', {
			filter: {
				':gt:plannedstart': "",
			},
			sort: "number"
		});
	},

	actions: {
		refresh() {
			this.refresh();
		}
	}
});
