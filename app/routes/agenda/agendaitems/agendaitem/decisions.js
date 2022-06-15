import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.query('decision-activity', {
      'filter[treatment][agendaitem][:id:]': this.agendaitem.id,
      include: 'report,treatment',
    });
  }

  async afterModel(model) {
    this.meeting = await this.modelFor('agenda').meeting;
    this.agendaItemTreatment = await model.firstObject.treatment;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    controller.meeting = this.meeting;
    controller.agendaItemTreatment = this.agendaItemTreatment;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
