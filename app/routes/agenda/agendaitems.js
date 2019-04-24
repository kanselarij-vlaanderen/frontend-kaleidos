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
		this.set('sessionService.selectedAgendaItem', null);

		const filterOptions = {
			filter: { agenda: { id: agenda.get('id') } },
			include: 'subcase.mandatees,subcase,subcase.case,postponed-to'
		}
		if(params.filter) {
			filterOptions['filter']['subcase'] = {'short-title':params.filter};
		}

		const agendaitems = await this.store.query('agendaitem', filterOptions);
		const announcements = agendaitems.filter((item) => item.showAsRemark);
		
		const groups = await this.reduceGroups(agendaitems, agenda);

		return hash({
			agendaitems: agendaitems,
			groups: groups,
			announcements: announcements.sortBy('created')
		});
	},

	async reduceGroups(agendaitems, agenda) {
		const { agendaService } = this;
		const sortedAgendaItems = await agendaService.getSortedAgendaItems(agenda);
		const itemsAddedAfterwards = []

		const filteredAgendaItems = await agendaitems.filter(agendaitem => {
			if (agendaitem && agendaitem.id && !agendaitem.showAsRemark) {
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


		const filteredAgendaGroupList = Object.values(await agendaService.reduceAgendaitemsByMandatees(filteredAgendaItems));
		const filteredAgendaGroupListAddedAfterwards = Object.values(await agendaService.reduceAgendaitemsByMandatees(itemsAddedAfterwards));
		let sortedAgendaGroupList = [];
		let sortedAgendaGroupListAddedAfterwards = [];

		if(filteredAgendaGroupList) {
			sortedAgendaGroupList = filteredAgendaGroupList.sortBy('foundPriority')
		} else {
			sortedAgendaGroupList = filteredAgendaGroupList;
		}

		if(filteredAgendaGroupList) {
			sortedAgendaGroupListAddedAfterwards = filteredAgendaGroupListAddedAfterwards.sortBy('foundPriority')
		} else {
			sortedAgendaGroupListAddedAfterwards = filteredAgendaGroupListAddedAfterwards;
		}

		return [
			sortedAgendaGroupList,
			sortedAgendaGroupListAddedAfterwards
		];
	},
});
