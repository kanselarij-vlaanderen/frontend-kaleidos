import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesDocumentsSubcaseDocumentsRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case.subcases-documents');
  }

  model(params) {
    return this.store.findRecord('subcase', params.subcase_id, {
      reload: true,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
  }
}
