import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcaseRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case.subcases');
  }

  model(params) {
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      page: {
        number: params.page,
        size: params.size,
      },
      sort: '-created',
    };
    return this.store.findRecord('subcase', params.subcase_id, {
      reload: true,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
  }
}
