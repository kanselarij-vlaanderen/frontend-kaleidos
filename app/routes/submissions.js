import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SubmissionsRoute extends Route {
  @service currentSession;
  @service router;
  @service('session') simpleAuthSession;

  async beforeModel(transition) {
    const isAuthenticated = this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (isAuthenticated && !this.currentSession.may('view-submissions')) {
      this.router.transitionTo('cases.index');
    }
  }
}
