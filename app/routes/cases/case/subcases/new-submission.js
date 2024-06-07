import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesNewSubmissionRoute extends Route {
  @service store;

  async model() {
    const { decisionmakingFlow } = this.modelFor('cases.case');
    return decisionmakingFlow;
  }
}
