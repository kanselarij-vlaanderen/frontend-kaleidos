import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let agenda = this.modelFor('sessions.session.agendas.agenda');
		return this.store.query('agendaitem', {
			filter: {
				agenda: { id: agenda.id }
			},
      sort: 'priority',
			include: ['subcase', 'documents']
		})
	},

	actions: {
		refresh() {
			this.refresh();
		},
    navigateToCreateAnnouncement(){
      this.set("selectedAgendaItem", null);
    }
	}
});
