import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CaseRoute extends Route {
  @service store;
  @service currentPublicationFlow;

  model() {
    return this.currentPublicationFlow.publicationFlow.case;
  }

  async afterModel(model) {
    await model.governmentAreas;
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: model.id,
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
