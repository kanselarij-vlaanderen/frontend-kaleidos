import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewslettersRoute extends Route {
  @service('session') simpleAuthSession;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');

    if (!this.currentSession.may('manage-news-items')) {
      this.router.transitionTo('index');
    }
  }
}
