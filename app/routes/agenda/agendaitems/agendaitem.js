import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaItemAgendaItemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: 'subcase'
    });
  }

  afterModel(model) {
    this.set('sessionService.selectedAgendaItem', model); // TODO: get rid of this global state
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const meeting = this.modelFor('agenda').meeting;
    controller.set('meeting', meeting);
    controller.set('model', model);
  }
}
