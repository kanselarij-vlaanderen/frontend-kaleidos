import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
	sessionService: inject(),

	async model(params) {
		const agendas = await this.store.query('agenda',
			{
				filter: {
					'created-for': { id: params.meeting_id }
				},
				sort: "name"
			});

		const lastAgenda = agendas.get('lastObject');
		const agendaitems = await this.store.query('agendaitem',
			{
				filter: {
					agenda: { id: lastAgenda.get('id') }
				},
				sort: "priority",
				include: "subcase,newsletter-info,subcase.phases,subcase.themes"
			});

		return hash({agendaitems: agendaitems, agenda:lastAgenda});
	}
});
