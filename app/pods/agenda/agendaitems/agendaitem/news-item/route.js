import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async beforeModel() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaItem.get('agendaActivity');
    if (!agendaActivity) {
      this.transitionTo('agenda.agendaitems.agendaitem.index')
    }
  }
  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);
    const agendaActivity = await agendaItem.get('agendaActivity');
    let subcase = null;
    if (agendaActivity) {
      subcase = await agendaActivity.get('subcase');
    }
    controller.set('subcase', subcase);
    const timestamp = await this.agendaService.retrieveModifiedDateFromNota(agendaItem, subcase);
    controller.set('timestampForMostRecentNota', timestamp);
    controller.set('model', model);
  }
}
