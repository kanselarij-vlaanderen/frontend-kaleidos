import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	authenticationRoute: 'mock-login',
	sessionService: inject(),
	agendaService: inject(),

	queryParams: {
		page: {
			refreshModel: true
		},
		size: {
			refreshModel: true
		}
	},

	async model(params) {
		const { agendaService } = this;
		const meeting = await this.store.findRecord('meeting', params.meeting_id);
		const agendas = await meeting.get('agendas');
		const lastAgenda = agendas.sortBy('name').get('lastObject');

		const agendaitems = await this.store.query('agendaitem',
			{
				filter: {
					agenda: { id: lastAgenda.get('id') },
					'show-as-remark': false
				},
				include: 'newsletter-info',
				sort: "priority",
				page: { number: params.page, size: params.size }
			});

		const sortedAgendaItems = await agendaService.getSortedAgendaItems(lastAgenda);

		let filteredAgendaItems = await agendaitems.filter(agendaitem => {
			if (agendaitem && agendaitem.id && !agendaitem.showAsRemark) {
				const foundItem = sortedAgendaItems.find(item => item.uuid === agendaitem.id);
				if (foundItem && !foundItem.confidential) {
					agendaitem.set('foundPriority', foundItem.priority);
					return agendaitem;
				}
			}
		});

		const filteredAgendaGroupList = Object.values(await agendaService.reduceAgendaitemsByMandatees(filteredAgendaItems));

		let newItems = [];

		filteredAgendaGroupList.map((item) => {
			newItems.push(...item.agendaitems);
		});

		return hash({
			agendaitems: newItems.sortBy('foundPriority'),
			agenda: lastAgenda,
			amountShowed: agendaitems.get('length'),
			amountOfItems: agendaitems.get('meta.count'),
			links: agendaitems.get('meta.pagination'),
			meeting: meeting
		});
	}
});
