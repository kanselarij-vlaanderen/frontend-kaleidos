import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	sessionService: inject(),

	model() {
		const agenda = this.get('sessionService.currentAgenda');
		return this.store.query('agendaitem', {
			filter: { agenda: {id: agenda.get('id')}},
			sort: 'priority'
		})
	}
});
