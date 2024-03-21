import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseSubcasesSubcaseRoute extends Route {
  @service store;

  model(params) {
    const { decisionmakingFlow, subcases } = this.modelFor('cases.case.subcases');
    return RSVP.hash({
      decisionmakingFlow,
      subcases,
      subcase: this.store.findRecord('subcase', params.subcase_id, { reload: true }),
    });
  }
}
