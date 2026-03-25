import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MonitoringRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    const isAuthenticated = this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (isAuthenticated && !this.currentSession.may('view-monitoring')) {
      return this.router.transitionTo('index');
    }
  }
}
