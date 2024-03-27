import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseSubcasesRoute extends Route {
  @service store;
  @service router;

  model() {
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const { decisionmakingFlow } = this.modelFor('cases.case');
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': decisionmakingFlow.id,
      sort: 'created',
      include:'type'
    };
    return RSVP.hash({
      decisionmakingFlow,
      subcases: this.store.queryAll('subcase', queryParams),
    });
  }
}
