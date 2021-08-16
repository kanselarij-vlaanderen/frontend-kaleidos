import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;

  // beforeModel(transition) {
  //   // this.simpleAuthSession.requireAuthentication(transition, 'login');
  // }

  async model(params) {
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }

  // setupController(controller) {
  //   super.setupController(...arguments);
  //   //controller.transition = transition;
  // }
}
