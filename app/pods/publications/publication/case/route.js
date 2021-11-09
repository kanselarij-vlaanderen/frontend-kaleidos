import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this.case_ = await model.case;
    await this.case_.governmentAreas;
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: this.case_.id,
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.case_ = this.case_;
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
