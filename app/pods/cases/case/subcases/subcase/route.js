import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CasesCaseSubcasesSubcaseRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('subcase', params.subcase_id, {
      reload: true,
    });
  }

  @action
  refreshParentModel() {
    this.send('refreshSubcasesRoute');
  }
}
