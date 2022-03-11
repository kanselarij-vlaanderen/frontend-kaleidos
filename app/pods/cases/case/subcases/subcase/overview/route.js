import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  // Model from parent

  async beforeModel() {
    this.case = this.modelFor('cases.case');
  }

  async afterModel(model) {
    // For showing the history of subcases within this route, we need a list of subcases without the current model
    const allSubcases = this.modelFor('cases.case.subcases');
    this.siblingSubcases = allSubcases.filter((subcase) => subcase.id !== model.id);
    this.mandatees = (await model.mandatees).sortBy('priority');
    this.submitter = await model.requestedBy;
    this.governmentAreas = await this.case.governmentAreas;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.siblingSubcases = this.siblingSubcases;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.case = this.case;
    controller.governmentAreas = this.governmentAreas;
  }
}
