import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.query('agenda-item-treatment', {
      'filter[agendaitem][:id:]': this.agendaitem.id,
      include: 'report',
    });
  }

  async afterModel() {
    this.meeting = await this.modelFor('agenda').meeting;
    const agendaActivity = await this.agendaitem.agendaActivity;
    this.subcase = await agendaActivity?.subcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    controller.meeting = this.meeting;
    controller.subcase = this.subcase;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
