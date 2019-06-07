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
			include: 'subcase,subcase.case',
			page: { 'size': 250 }
		}

		if (params.filter) {
			filterOptions['filter']['subcase'] = { 'short-title': params.filter };
		}

		const agendaitems = await this.store.query('agendaitem', filterOptions);
		const announcements = agendaitems.filter((item) => item.get('subcase.showAsRemark'));

		const groups = await this.agendaService.newSorting(session, agenda.get('id'));
		const { lastPrio, firstAgendaItem } = await this.agendaService.parseGroups(groups, agendaitems);
		this.set('sessionService.firstAgendaItemOfAgenda', firstAgendaItem);

		return hash({
			currentAgenda: agenda,
			groups: groups,
			announcements,
			lastPrio
		});
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
