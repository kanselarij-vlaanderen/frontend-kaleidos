import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let agenda = this.modelFor('agendas.agenda');
		return this.store.query('agendaitem', {
			filter: {
				agenda: { id: agenda.id }
			},
			include: 'subcase'
		})
	},

	actions: {
		refresh() {
			this.refresh();
		}
	}
});
