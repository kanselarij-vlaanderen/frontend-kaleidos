import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
	authenticationRoute: 'mock-login',
	sessionService: inject(),

	queryParams: {
		page: {
			refreshModel: true
		},
		size: {
			refreshModel: true
		}
	},

	async model(params) {
		const meeting = await this.store.findRecord('meeting', params.meeting_id);
		const agendas = await meeting.get('agendas');
		const lastAgenda = agendas.sortBy('name').get('lastObject');

		const agendaitems = await this.store.query('agendaitem',
			{
				filter: {
					agenda: { id: lastAgenda.get('id') },
					'show-as-remark': false
				},
				include: 'newsletter-info,newsletter-info.document-versions',
				sort: "priority",
				page: { number: params.page, size: params.size }
			});
		return hash({
			agendaitems: agendaitems,
			agenda: lastAgenda,
			amountShowed: agendaitems.get('length'),
			amountOfItems: agendaitems.get('meta.count'),
			links: agendaitems.get('meta.pagination'),
			meeting: meeting
		});
	}
});
