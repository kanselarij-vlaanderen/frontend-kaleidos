import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcasesRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case');
  }

  model(params) {
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      sort: 'created',
      include:'type'
    };
    return this.store.queryAll('subcase', queryParams);
  }

  async afterModel(model) {
    const selectedSubcase = await model.lastObject;
    if (selectedSubcase) {
      this.router.transitionTo('cases.case.subcases.subcase', selectedSubcase.id);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
  }
}
