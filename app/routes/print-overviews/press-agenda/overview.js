import Route from '@ember/routing/route';
import SortedAgendaItemsRouteMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';

export default Route.extend(SortedAgendaItemsRouteMixin, {
	type: 'press-agenda',
	include: null,

	queryParams: {
		definite: { refreshModel: true }
	},

	async parseAgendaItems(agenda, session, definite) {
		let agendaitems = await (await agenda.get('agendaitems')).filter((item) => !item.get('subcase.showAsRemark'));
		let filteredAgendaItems = [];
		if (definite === "true") {
			const publicItems = agendaitems.filter((item) => item.get('forPress'));
			filteredAgendaItems.push(...publicItems);
		} else {
			filteredAgendaItems.push(...agendaitems);
		}

		const announcements = agendaitems.filter((item) => item.get('subcase.showAsRemark'));

		const groups = await this.agendaService.newSorting(session, agenda.get('id'));

		return { groups, announcements };
	},
});	
