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

  afterModel() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.meeting = this.modelFor('agenda').meeting;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    controller.meeting = this.meeting;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
