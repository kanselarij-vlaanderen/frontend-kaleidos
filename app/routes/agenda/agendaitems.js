import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
	sessionService: inject(),
	agendaService: inject(),

	queryParams: {
		filter: { refreshModel: true }
	},

	async model(params) {
		const agenda = await this.get('sessionService.currentAgenda');

		const filterOptions = {
			filter: { agenda: { id: agenda.get('id') } },
			include: 'subcase.phases.code,agenda,subcase,subcase.case,subcase.themes,subcase.mandatees,postponed-to,subcase.phases'
		}
		if(params.filter) {
			filterOptions['filter']['subcase'] = {'short-title':params.filter};
		}

		const agendaitems = await this.store.query('agendaitem', filterOptions);
		const groups = await this.reduceGroups(agendaitems, agenda);
		return hash({
			agendaitems: agendaitems,
			groups: groups,
			announcements: this.store.query('announcement', {
				filter: { agenda: { id: agenda.get('id') } }
			})
		});
	},

	async reduceGroups(agendaitems, agenda) {
		const { agendaService } = this;
		const sortedAgendaItems = await agendaService.getSortedAgendaItems(agenda);
		const itemsAddedAfterwards = []

		const filteredAgendaItems = agendaitems.filter(agendaitem => {
			if (agendaitem && agendaitem.id) {
				if (agendaitem.priority) {
					const foundItem = sortedAgendaItems.find(item => item.uuid === agendaitem.id);
					if (foundItem) {
						agendaitem.set('foundPriority', foundItem.priority);
						return agendaitem;
					}
				} else {
					itemsAddedAfterwards.push(agendaitem);
				}
			}
		});
		const filteredAgendaGroupList = await agendaService.reduceAgendaitemsByMandatees(filteredAgendaItems);
		const filteredAgendaGroupListAddedAfterwards = await agendaService.reduceAgendaitemsByMandatees(itemsAddedAfterwards);

		return [
			Object.values(filteredAgendaGroupList).sortBy('foundPriority'),
			Object.values(filteredAgendaGroupListAddedAfterwards).sortBy('foundPriority')
		];
	},
});
