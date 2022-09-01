import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service publicationService;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const _case = await model.case;
    this.decisionmakingFlow = await _case.decisionmakingFlow;
    await this.decisionmakingFlow.governmentAreas;
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(model);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
