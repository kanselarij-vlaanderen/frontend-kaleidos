import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		const agendaitem_id = params.agendaitem_id;
		return this.store.findRecord('agendaitem', agendaitem_id, {
			include: 'subcase,subcase.themes,subcase.mandatees,subcase.government-domains,subcase.phases,subcase.case,subcase.document-versions,decision,remarks,attendees,meeting-record,subcase.document-versions.document,subcase.document-versions.document.type'
		});
	}
});
