import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {

  async beforeModel() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaitem.subcase;
    if (!subcase) {
      this.transitionTo('agenda.agendaitems.agendaitem.index')
    }
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaitem.subcase;
    const decisions = await this.store.query('decision', {
      'filter[subcase][:id:]': subcase.id,
      'include': 'signed-document'
    });
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
