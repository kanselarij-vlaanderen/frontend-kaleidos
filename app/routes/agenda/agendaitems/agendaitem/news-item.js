import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);
    const subcase = await agendaItem.get('subcase');
    controller.set('subcase', subcase);
    const timestamp = await this.agendaService.retrieveModifiedDateFromNota(agendaItem);
    controller.set('timestampForMostRecentNota', timestamp);
    controller.set('model', model);
  }
}
