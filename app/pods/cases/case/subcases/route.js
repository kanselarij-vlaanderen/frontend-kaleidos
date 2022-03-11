import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CasesCaseSubcasesRoute extends Route {
  @service store;

  model() {
    const _case = this.modelFor('cases.case');
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    return this.store.query('subcase', {
      filter: {
        case: {
          id: _case.id,
        },
      },
      sort: '-created',
    });
  }

  @action
  refreshSubcasesRoute() {
    this.refresh();
  }
}
