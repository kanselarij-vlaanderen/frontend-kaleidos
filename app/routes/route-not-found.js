import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class RouteNotFoundRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }
}
