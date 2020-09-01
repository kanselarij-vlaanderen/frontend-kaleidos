import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class NewsletterRoute extends Route.extend(AuthenticatedRouteMixin) {
  async model(params) {
    const meeting = await this.store.findRecord('meeting', params.meeting_id);
    const latestAgenda = await meeting.get('latestAgenda');
    return {
      meeting,
      agenda: latestAgenda,
    };
  }
}
