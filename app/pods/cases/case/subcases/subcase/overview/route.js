import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async afterModel(model) {
    this.allSubcases = await model.subcasesFromCase;
    this.mandatees = (await model.mandatees).sortBy('priority');
    this.submitter = await model.requestedBy;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.allSubcases = this.allSubcases;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
  }
}
