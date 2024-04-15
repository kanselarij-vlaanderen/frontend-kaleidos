import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SubcaseRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('subcase', params.subcase_id);
  }

  async redirect(model) {
    const decisionmakingFlow = await model.decisionmakingFlow;
    this.router.replaceWith('cases.case.subcases.subcase', decisionmakingFlow.id, model.id);
  }
}
