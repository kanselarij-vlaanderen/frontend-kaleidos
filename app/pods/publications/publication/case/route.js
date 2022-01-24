import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service store;

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this._case = await model.case;
    await this._case.governmentAreas;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller._case = this._case;
  }
}
