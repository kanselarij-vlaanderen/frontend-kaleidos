import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverviewRoute extends Route {
  beforeModel() {
    this.case = this.modelFor('cases.case');
  }

  model() {
    return this.modelFor('cases.case.subcases');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.case;
  }

  @action
  refreshParentModel() {
    this.send('refreshSubcasesRoute');
  }
}
