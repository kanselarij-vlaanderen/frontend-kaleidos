import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaitemRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id);
  }

  async afterModel(model) {
    const agenda = await model.agenda;
    const meeting = await agenda.createdFor;
    this.router.transitionTo('agenda.agendaitems.agendaitem', meeting.id, agenda.id, model.id);
  }
}
