import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');

    if (!this.currentSession.may('manage-settings')) {
      this.router.transitionTo('index');
    }
  }
}
