import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.queryOne('decision-activity', {
      'filter[treatment][agendaitems][:id:]': this.agendaitem.id,
      include: 'report,treatment',
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
    const meeting = this.modelFor('agenda').meeting;
    controller.meeting = meeting;
    const agenda = this.modelFor('agenda').agenda;
    controller.agenda = agenda;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
