import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
	sessionService: inject(),
	agendaService: inject(),
	maxInt: Number.MAX_SAFE_INTEGER,

	async model() {
		const agenda = this.get('sessionService.currentAgenda');
		const agendaitems = await this.store.query('agendaitem', {
			filter: { agenda: { id: agenda.get('id') } },
			include: 'subcase.phases.code,agenda,subcase,subcase.case,subcase.themes,subcase.mandatees,postponed-to,subcase.phases'
		})

		const groupedItems = await this.reduceGroups(agendaitems, agenda);
		return hash({ agendaitems: agendaitems, groups:groupedItems.sortBy('foundPriority') , addedAfterwards: agendaitems.filter(item => !!item.priority) });
	},

	async reduceGroups(agendaitems, agenda) {
		const { agendaService, maxInt } = this;
		const sortedAgendaItems = await agendaService.getSortedAgendaItems(agenda);

		const filteredAgendaItems = agendaitems.filter(agendaitem => {
			if (agendaitem && agendaitem.id) {
				if(agendaitem.priority){
					const foundItem = sortedAgendaItems.find(item => item.uuid === agendaitem.id);
					if (foundItem) {
						agendaitem.foundPriority = foundItem.priority;
						return agendaitem;
					}
				} else {
					agendaitem.foundPriority = maxInt;
					return agendaitem;
				}
			}
		});

		const filteredAgendaGroupList = filteredAgendaItems.reduce((items, agendaitem) => {
			const mandatees = agendaitem.get('subcase').get('mandatees').sortBy('priority');
			let titles = mandatees.map((mandatee) => mandatee.title);
				
			if (titles && titles != []) {
				titles = titles.join(', ');
				if(agendaitem.get('foundPriority') === maxInt) {
					titles = "Toegevoegd";
				}
				items[titles] = items[titles] || { groupName: titles, agendaitems: [], foundPriority: agendaitem.foundPriority };
				items[titles].foundPriority = Math.min(items[titles].foundPriority, agendaitem.foundPriority);
				items[titles].agendaitems.push(agendaitem);
				return items;
			}
		}, {});
		
		return Object.values(filteredAgendaGroupList);
	},
});
