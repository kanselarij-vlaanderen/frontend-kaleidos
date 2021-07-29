import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverviewRoute extends Route {
  beforeModel() {
    this.case = this.modelFor('cases.case');
  }

  model() {
    return this.store.query('subcase', {
      filter: {
        case: {
          id: this.case.id,
        },
      },
      sort: '-created',
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.case;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
