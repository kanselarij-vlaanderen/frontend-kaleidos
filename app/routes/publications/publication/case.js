import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
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
