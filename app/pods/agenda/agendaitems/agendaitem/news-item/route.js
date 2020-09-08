/* eslint-disable class-methods-use-this */
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;

  async beforeModel() {
    // Because NewsletterInfo is connected via treatment:
    // Check if a treatment exists, otherwise redirect gracefully. This should only happen with corrupt data.
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaitemTreatments = await agendaitem.get('treatments');
    const agendaitemTreatment = agendaitemTreatments.firstObject; // TODO: Agendaitem can have many treatments (decisions)
    if (!agendaitemTreatment) {
      warn(`Agenda item "${agendaitem.id}" is missing a treatment`);
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  async model() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaitemTreatments = await agendaitem.get('treatments');
    const agendaitemTreatment = agendaitemTreatments.firstObject; // TODO: Agendaitem can have many treatments (decisions)
    const newsletterInfo = await agendaitemTreatment.get('newsletterInfo');
    return newsletterInfo;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.set('agendaitem', agendaitem);

    const agendaitemTreatment = await agendaitem.get('agenda-item-treatment');
    controller.set('agendaitemTreatment', agendaitemTreatment);

    controller.set('notaModifiedTime',
      await this.agendaService.retrieveModifiedDateFromNota(controller.get('agendaitem')));

    controller.set('model', model);
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    if (transition && !transition.data.isRefresh) {
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
