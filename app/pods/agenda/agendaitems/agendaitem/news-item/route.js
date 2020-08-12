import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async beforeModel() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaitem.get('agendaActivity');
    if (!agendaActivity) {
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);
    const agendaActivity = await agendaitem.get('agendaActivity');
    let subcase = null;
    if (agendaActivity) {
      subcase = await agendaActivity.get('subcase');
    }
    controller.set('subcase', subcase);
    const timestamp = await this.agendaService.retrieveModifiedDateFromNota(agendaitem, subcase);
    controller.set('timestampForMostRecentNota', timestamp);
    controller.set('model', model);
  }
}
