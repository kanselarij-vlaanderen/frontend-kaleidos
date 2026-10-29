import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SubcaseRoute extends Route {
  @service store;
  @service router;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }

  model(params) {
    return this.store.findRecord('subcase', params.subcase_id);
  }

  async redirect(model) {
    const decisionmakingFlow = await model.decisionmakingFlow;
    this.router.replaceWith('cases.case.subcases.subcase', decisionmakingFlow.id, model.id);
  }
}
