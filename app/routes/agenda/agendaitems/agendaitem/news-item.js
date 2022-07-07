/* eslint-disable class-methods-use-this */
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default class NewsitemAgendaitemAgendaitemsAgendaRoute extends Route {
  @service agendaService;
  @service store;

  async beforeModel() {
    // Because NewsletterInfo is connected via treatment:
    // Check if a treatment exists, otherwise redirect gracefully. This should only happen with corrupt data.
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    this.agendaItemTreatment = await agendaitem.treatment;
    if (!this.agendaItemTreatment) {
      warn(`Agenda item "${agendaitem.id}" is missing a treatment`, {
        id: 'broken-data.missing-agenda-item-treatment',
      });
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  async model() {
    this.newsletterInfo = await this.store.queryOne('newsletter-info', {
      'filter[agenda-item-treatment][:id:]': this.agendaItemTreatment.id,
    });
  }

  async setupController(controller) {
    super.setupController(...arguments);
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    controller.agendaitem = agendaitem;
    controller.newsletterInfo = this.newsletterInfo;
    const notaModifiedTime = await this.agendaService.retrieveModifiedDateFromNota(agendaitem);
    controller.notaModifiedTime = notaModifiedTime;
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
