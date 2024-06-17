import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesRoute extends Route {
  @service store;
  @service router;

  model() {
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const { decisionmakingFlow, subcases, parliamentFlow } =
      this.modelFor('cases.case');
    return {
      decisionmakingFlow,
      subcases,
      parliamentFlow,
    };
  }
}
