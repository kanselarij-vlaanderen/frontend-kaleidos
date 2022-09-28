import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service store;
  @service publicationService;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this.governmentAreas = await model.governmentAreas;
    const isViaCouncilOfMinisters = await this.publicationService.getIsViaCouncilOfMinisters(model);
    if (isViaCouncilOfMinisters) {
      const decisionActivity = await model.decisionActivity;
      const [meetingId, agendaId, ] = await this.publicationService.getModelsForAgendaitemFromDecisionActivity(decisionActivity);
      this.meeting = await this.store.findRecord('meeting', meetingId);
      this.agenda = await this.store.findRecord('agenda', agendaId);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.governmentAreas = this.governmentAreas;
    controller.meeting = this.meeting;
    controller.agenda = this.agenda;
  }
}
