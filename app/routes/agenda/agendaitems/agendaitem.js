import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		const agendaitem_id = params.agendaitem_id;
		return this.store.findRecord('agendaitem', agendaitem_id, {
			include: 'subcase,subcase.themes,subcase.mandatees,subcase.document-versions,decision,remarks,attendees,meeting-record'
		});
	}
});
