import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaItemAgendaItemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    const agendaitem_id = params.agendaitem_id;
    let activeAGendaItemSection = localStorage.getItem('activeAgendaItemSection');
    if (!activeAGendaItemSection) {
      localStorage.setItem('activeAgendaItemSection', 'details');
    }
    return this.store.findRecord('agendaitem', agendaitem_id, {
      include: 'agenda-activity,agenda-activity.subcase'
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
