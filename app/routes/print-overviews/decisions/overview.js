import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
	agendaService: inject(),
	sessionService: inject(),

	queryParams: {
		selectedAgenda_id: { refreshModel: true }
	},

	async model(params) {
		const currentSession = await this.store.findRecord('meeting', params.meeting_id)
		const currentAgenda = await this.store.findRecord('agenda', params.selectedAgenda_id)
		const sortedAgendaItemIds = await this.get('agendaService').getSortedAgendaItems(currentAgenda);
		const sortedAgendaItems = await Promise.all(sortedAgendaItemIds.map(async (item) => {
			if (item.uuid) {
				const agendaitem = await this.store.findRecord('agendaitem', item.uuid, { include: 'subcase,subcase.mandatees' });
				agendaitem.set('foundPriority', item.priority);
				return agendaitem;
			}
		}));
		const agendaitemGroups = Object.values(await this.get('agendaService').reduceAgendaitemsByMandatees(sortedAgendaItems));

		return hash({ agendaitemGroups: agendaitemGroups, currentSession: currentSession });
	}
});
