import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const model = await this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
    return model;
  }

  async afterModel(model) {
    this.decisionActivity = await this.store.queryOne('decision-activity', {
      filter: {
        report: {
          ':id:': model?.id,
        },
      },
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decisionActivity = this.decisionActivity;
  }
}
