import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model() {
    this.agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.queryOne('decision-activity', {
      'filter[treatment][agendaitem][:id:]': this.agendaitem.id,
      include: 'report,treatment',
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.agendaitem = this.agendaitem;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
