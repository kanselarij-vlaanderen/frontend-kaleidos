import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;

  model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.findRecord('agendaitem', agendaItem.id, {
      // TODO: assess which data we want to load here, and which data we want to sideload in the
      // different panel-components (when those get refactored for data-loading). At least the mandatees
      // need to be reloaded here (from the backend), since the overview only loads a few mandatee-fields for efficfiency
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.type',
        'agenda-activity.subcase.mandatees',
        'type',
      ].join(','),
    });
  }

  async afterModel(model) {
    this.agendaActivity = await model.agendaActivity;
    this.subcase = await this.agendaActivity?.subcase;
    this.submitter = undefined;
    if (this.subcase) {
      this.submitter = await this.subcase.requestedBy;
      await this.subcase.governmentAreas;
    }
    const agendaItemTreatment = await model.treatment;
    this.newsItem = await agendaItemTreatment?.newsItem;
    const decisionActivity = await agendaItemTreatment?.decisionActivity;
    await decisionActivity?.decisionResultCode;
    // When routing here from agenda overview with stale data, we need to reload several relations
    // The reload in model refreshes only the attributes and includes relations, makes saves with stale relation data possible
    await model.hasMany('mandatees').reload();
    await model.hasMany('pieces').reload();
    this.mandatees = (await model.mandatees).slice().sort((m1, m2) => m1.priority - m2.priority);
  }

  async setupController(controller) {
    super.setupController(...arguments);
    // modelFor('agenda') contains agenda and meeting object.
    controller.meeting = this.modelFor('agenda').meeting;
    controller.agenda = this.modelFor('agenda').agenda;
    controller.reverseSortedAgendas = this.modelFor('agenda').reverseSortedAgendas;
    controller.agendaActivity = this.agendaActivity;
    controller.subcase = this.subcase;
    controller.newsItem = this.newsItem;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
  }
}
