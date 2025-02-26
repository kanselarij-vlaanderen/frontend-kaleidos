import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    const isAuthenticated = this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (isAuthenticated && !this.currentSession.may('manage-settings')) {
      this.router.transitionTo('index');
    }
  }
}
