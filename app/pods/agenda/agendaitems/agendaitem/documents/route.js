import Route from '@ember/routing/route';

export default class DocumentsAgendaitemAgendaitemsAgendaRoute extends Route {
  // TODO: refactor so data is sourced from the route's model hook.
  // model() {
  //   return {
  //     documents: this.modelFor('agenda.agendaitems.agendaitem').get('documentVersions'),
  //     linkedDocuments: this.modelFor('agenda.agendaitems.agendaitem').get('linkedDocumentVersions')
  //   };
  // }

  setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    controller.set('model', model);
  }
}
