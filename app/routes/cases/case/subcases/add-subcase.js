import Route from '@ember/routing/route';

export default class CasesCaseSubcasesAddSubcaseRoute extends Route {

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
  }

}
