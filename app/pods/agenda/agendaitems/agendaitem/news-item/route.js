import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async beforeModel() {
    // Check if a treatment exists, otherwise redirect gracefully. This should only happen with corrupt data.
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

    controller.set('notaModifiedTime',
      await this.agendaService.retrieveModifiedDateFromNota(controller.get('agendaItem')));

    controller.set('model', model);
  }

  resetController(controller, _, transition) {
    if (!transition.data.isRefresh) {
      controller.isEditing = false;
    }
    controller.notaModifiedWarningConfirmed = false;
  }

  @action
  reloadModel() {
    const transition = this.refresh();
    transition.data.isRefresh = true;
  }
}
