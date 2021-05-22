import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsletterRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const meeting = await this.store.findRecord('meeting', params.meeting_id);
    const latestAgenda = await meeting.get('latestAgenda');
    return {
      meeting,
      agenda: latestAgenda,
    };
  }
}
