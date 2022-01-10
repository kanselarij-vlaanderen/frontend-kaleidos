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
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: this._case.id,
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller._case = this._case;
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
