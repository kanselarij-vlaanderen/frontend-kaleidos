import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
	sessionService: inject(),

	model(params) {
		const agendaitem_id = params.agendaitem_id;
		return this.store.findRecord('agendaitem', agendaitem_id, {
			include: 'document-versions,subcase.themes,government-domains,agenda,subcase,subcase.mandatees,subcase.government-domains,subcase.phases,subcase.case,subcase.document-versions,subcase.document-versions.document,subcase.document-versions.document.type,subcase.decision'
		});
	},

	afterModel(model) {
		this.set('sessionService.selectedAgendaItem', model);
	}
});
