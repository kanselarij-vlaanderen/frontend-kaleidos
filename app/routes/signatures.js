import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SignaturesRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');

    if (!this.currentSession.may('manage-signatures')) {
      this.router.transitionTo('index');
    }
  }
}
