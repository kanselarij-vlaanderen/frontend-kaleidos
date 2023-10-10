import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesAddSubcaseRoute extends Route {
  @service store;

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
    this.decisionmakingFlow = this.modelFor('cases.case');
  }

  model(params) {
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
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
    controller.decisionmakingFlow = this.decisionmakingFlow;
  }
}
