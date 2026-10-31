import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NewsletterRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }

  async model(params) {
    const meeting = await this.store.findRecord('meeting', params.meeting_id);
    const latestAgenda = await this.store.queryOne('agenda', {
      'filter[created-for][:id:]': meeting.id,
      sort: '-serialnumber',
      include: 'status',
    });
    return {
      meeting,
      agenda: latestAgenda,
    };
  }
  
  afterModel() {
    if (!this.currentSession.may('manage-news-items')) {
      this.router.replaceWith('newsletter.print');
    }
  }
}
