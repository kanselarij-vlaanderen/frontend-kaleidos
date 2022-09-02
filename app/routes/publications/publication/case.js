import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service publicationService;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const _case = await model.case;
    const dmf = await _case.decisionmakingFlow;
    this.governmentAreas = await dmf?.governmentAreas;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.governmentAreas = this.governmentAreas;
  }
}
