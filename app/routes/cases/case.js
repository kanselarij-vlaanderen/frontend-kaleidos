import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('decisionmaking-flow', params.id, {
      reload: true,
    });
  }
}
