import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem')
    const subcase = await agendaItem.subcase;
    const decisions = await subcase.hasMany('decisions').reload();
    return decisions;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaItem.subcase;
    controller.agendaItem = agendaItem;
    controller.subcase = subcase;
    controller.model = model;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
