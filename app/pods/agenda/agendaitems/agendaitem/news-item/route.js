import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async beforeModel() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaItem.get('agendaActivity');
    if (!agendaActivity) {
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  async model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const AgendaItemTreatment = await agendaItem.get('agendaItemTreatment');
    const newsletterInfo = await AgendaItemTreatment.get('newsletterInfo');
    return newsletterInfo;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);

    const AgendaItemTreatment = await agendaItem.get('agenda-item-treatment');
    controller.set('AgendaItemTreatment', AgendaItemTreatment);

    const timestamp = await this.agendaService.retrieveModifiedDateFromNota(agendaItem);
    controller.set('timestampForMostRecentNota', timestamp);
    controller.set('model', model);
  }
}
