import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
	sessionService: inject(),
	agendaService: inject(),

	queryParams: {
		filter: { refreshModel: true },
		refresh: { refreshModel: true }
	},

	async model(params) {

		const agenda = await this.get('sessionService.currentAgenda');
		this.set('sessionService.selectedAgendaItem', null);
		const session = this.modelFor('agenda');

		const filterOptions = {
			filter: { agenda: { id: agenda.get('id') } },
			include: 'subcase',
			page: { 'size': 250 }
		}
		if (params.filter) {
			filterOptions['filter']['subcase'] = { 'short-title': params.filter };
		}

		// const agendaitems = await this.store.query('agendaitem', filterOptions);
		// const announcements = agendaitems.filter((item) => item.showAsRemark);

		const groups = await this.agendaService.newSorting(session, agenda.get('id'));

		console.log(groups);
		return hash({
			// agendaitems: agendaitems,
			groups: groups,
			// announcements: announcements.sortBy('created')
		});
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
