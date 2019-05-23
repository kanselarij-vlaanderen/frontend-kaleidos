import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	sessionService: inject(),

	model(params) {
		const agendaitem_id = params.agendaitem_id;
		return this.store.findRecord('agendaitem', agendaitem_id, {
			include: 'subcase'
		});
	},

	afterModel(model) {
		this.set('sessionService.selectedAgendaItem', model);
	}
});
