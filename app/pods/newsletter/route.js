import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewsletterRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
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
}
