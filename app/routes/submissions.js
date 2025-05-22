import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SubmissionsRoute extends Route {
  @service currentSession;
  @service router;
  @service('session') simpleAuthSession;

  // We only want to load the defaults once. Changes made after stay untill all checkboxes are cleared.
  loadedDefaults = false;

  async beforeModel(transition) {
    const isAuthenticated = this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (isAuthenticated && !this.currentSession.may('view-submissions')) {
      this.router.transitionTo('cases.index');
    }
  }
}
