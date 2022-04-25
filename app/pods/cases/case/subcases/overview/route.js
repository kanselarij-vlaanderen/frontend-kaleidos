import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverviewRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
  };

  beforeModel() {
    this.case = this.modelFor('cases.case');
  }

  model(params) {
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const queryParams = {
      filter: {
        case: {
          id: this.case.id,
        },
      },
      page: {
        number: params.page,
        size: params.size,
      },
      sort: '-created',
    };
    return this.store.query('subcase', queryParams);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.case;
  }

  @action
  refreshSubcasesRoute() {
    this.refresh();
  }
}
