import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async setupController(controller, model) {
    super.setupController(...arguments);
    controller.allSubcases = await model.subcasesFromCase;
  }
}
