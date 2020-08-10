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
    const agendaItemTreatments = await agendaItem.get('treatments');
    const agendaItemTreatment = agendaItemTreatments.firstObject; // TODO: AgendaItem can have many treatments (decisions)
    const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
    return newsletterInfo;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaItem', agendaItem);

    const agendaItemTreatment = await agendaItem.get('agenda-item-treatment');
    controller.set('agendaItemTreatment', agendaItemTreatment);

    const timestamp = await this.agendaService.retrieveModifiedDateFromNota(agendaItem); // Nog stuk ... needs subcase
    controller.set('timestampForMostRecentNota', timestamp);
    controller.set('model', model);
  }
}
