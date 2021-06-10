import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    this.agendaitem = await this.modelFor('agenda.agendaitems.agendaitem');
    return await this.store.query('agenda-item-treatment', {
      'filter[agendaitem][:id:]': this.agendaitem.id,
      include: 'report',
    });
  }

  async afterModel() {
    this.meeting = await this.modelFor('agenda').meeting;
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
