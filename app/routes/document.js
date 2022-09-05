import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }

  async afterModel(model) {
    const decisionActivity = await this.store.queryOne('decision-activity', {
      filter: {
        report: {
          ':id:': model?.id,
        },
      },
    });
    this.pieceIsFromDecision = isPresent(decisionActivity);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.pieceIsFromDecision = this.pieceIsFromDecision;
  }
}
