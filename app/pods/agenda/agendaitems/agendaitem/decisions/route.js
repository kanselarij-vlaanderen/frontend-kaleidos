import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {

  async beforeModel() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaitem.subcase;
    if (!subcase) {
      this.transitionTo('agenda.agendaitems.agendaitem.index')
    }
    subcase.hasMany('decisions').reload();
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaitem.subcase;
    const decisions = await subcase.get('decisions');
    controller.set('agendaitem', agendaitem);
    controller.set('subcase', subcase);
    controller.set('decisions', decisions);
    controller.set('model', model);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
