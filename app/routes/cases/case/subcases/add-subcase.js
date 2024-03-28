import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesAddSubcaseRoute extends Route {
  @service store;

  async model() {
    const { decisionmakingFlow, subcases } = this.modelFor('cases.case.subcases');
    const latestSubcase = subcases.slice().at(-1);
    await latestSubcase?.mandatees;
    await latestSubcase?.governmentAreas;

    return {
      decisionmakingFlow,
      latestSubcase,
    }
  }
}
