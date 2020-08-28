import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async beforeModel() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaitem.get('agendaActivity');
    if (!agendaActivity) {
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
    const subcase = await agendaActivity.subcase;
    subcase.hasMany('decisions').reload();
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaitem.get('agendaActivity');
    const subcase = await agendaActivity.subcase;
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
