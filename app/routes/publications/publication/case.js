import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service publicationService;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this.governmentAreas = await model.governmentAreas;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.governmentAreas = this.governmentAreas;
  }
}
