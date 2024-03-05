import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesAddSubcaseRoute extends Route {
  @service store;

  async beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case');
    this.latestSubcase = await this.store.queryOne('subcase', {
      filter: {
        'decisionmaking-flow': {
          ':id:': this.decisionmakingFlow.id,
        },
      },
      sort: '-created',
    });
    await this.latestSubcase?.mandatees;
    await this.latestSubcase?.governmentAreas;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionmakingFlow = this.decisionmakingFlow;
    controller.latestSubcase = this.latestSubcase;
  }
}
