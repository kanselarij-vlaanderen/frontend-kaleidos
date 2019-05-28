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

		const filterOptions = {
			filter: { agenda: { id: agenda.get('id') } },
			include: 'subcase.mandatees,subcase',
			page: { 'size': 250 }
		}
		if (params.filter) {
			filterOptions['filter']['subcase'] = { 'short-title': params.filter };
		}

		const agendaitems = await this.store.query('agendaitem', filterOptions);
		const announcements = agendaitems.filter((item) => item.showAsRemark);

		const groups = await this.reduceGroups(agendaitems, agenda.get('id'));

		return hash({
			agendaitems: agendaitems,
			groups: groups,
			announcements: announcements.sortBy('created')
		});
	},

	async reduceGroups(agendaitems, currentAgendaID) {
		const { agendaService } = this;
		const session = this.modelFor('agenda');
		const agendaitemsFilteredPerAgenda = await this.agendaService.newSorting(session, currentAgendaID);

		const filteredAgendaItems = await agendaitems.filter(agendaitem => {
			if (agendaitem && agendaitem.id) {
				const foundItem = agendaitemsFilteredPerAgenda.find(item => item.subcaseId === agendaitem.get('subcase.id'));
				if (foundItem) {
					if (!agendaitem.showAsRemark) {
						agendaitem.set('agendaName', foundItem.agendaName);
						agendaitem.set('foundPriority', agendaitem.priority);
						return agendaitem;
					}
				}
			}
		});

		const agendaitemsPerAgenda = filteredAgendaItems.reduce((items, item) => {
			items[item.agendaName] = items[item.agendaName] || { agendaitems: [] };
			items[item.agendaName].agendaitems.push(item);
			return items;
		}, {})

		const keys = Object.keys(agendaitemsPerAgenda);
		const result = await Promise.all(keys.map(async (agenda) => {
			return Object.values(await agendaService.reduceAgendaitemsByMandatees(agendaitemsPerAgenda[agenda].agendaitems.sortBy('priority')));
		}));

		return result;
	},

	actions: {
		refresh() {
			this._super(...arguments);
			this.refresh();
		}
	}
});
