import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemAgendaitemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: 'agenda-activity,agenda-activity.subcase,agenda-activity.subcase.requested-by',
    });
  }

  afterModel(model) {
    this.set('sessionService.selectedAgendaitem', model); // TODO: get rid of this global state
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const {
      meeting,
    } = this.modelFor('agenda');
    controller.set('meeting', meeting);
    controller.set('model', model);
  }
}
