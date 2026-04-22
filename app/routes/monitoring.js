import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { isEnabledDataMonitoring } from 'frontend-kaleidos/utils/feature-flag';

export default class MonitoringRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    const isAuthenticated = this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (isEnabledDataMonitoring() && isAuthenticated && !this.currentSession.may('view-monitoring')) {
      return this.router.transitionTo('index');
    }
    if (transition.to.name != 'monitoring.newsletter') {
      this.router.replaceWith('monitoring.data-propagation');
    }
  }
}
