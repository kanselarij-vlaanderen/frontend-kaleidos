import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    const agendaitem = await this.modelFor('agenda.agendaitems.agendaitem');
    return await this.store.query('agenda-item-treatment', {
      'filter[agendaitem][:id:]': agendaitem.id,
      include: 'report',
    });
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = await this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    const agendaActivity = await agendaitem.get('agendaActivity');
    if (agendaActivity) { // Some items don't have a subcase nor a "put on agenda"-activity
      const subcase = await agendaActivity.subcase;
      controller.set('subcase', subcase);
    }
    controller.set('model', model);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
