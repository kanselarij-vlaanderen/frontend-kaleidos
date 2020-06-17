import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {

  async beforeModel() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaItem.subcase;
    if (!subcase) {
      this.transitionTo('agenda.agendaitems.agendaitem.index')
    }
  }

  async model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaItem.subcase;
    return this.store.query('decision', {
      'filter[subcase][:id:]': subcase.id,
      'include': 'signed-document'
    });
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
