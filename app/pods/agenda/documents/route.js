import Route from '@ember/routing/route';

export default class AgendaDocumentsRoute extends Route {
  model() {
    const parentModel = this.modelFor('agenda');
    return parentModel.meeting;
  }
}
