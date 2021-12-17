import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsletterRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return await this.store.findRecord('meeting', params.meeting_id);
  }
}
