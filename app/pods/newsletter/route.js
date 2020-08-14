import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsletterRoute extends Route.extend(AuthenticatedRouteMixin) {
  queryParams = {
    sort: {
      refreshModel: true,
    },
  };
  @service currentSession;

  /* Although counterintuïtive for a route named "newsletter", this model needs to
   * be centered around agenda-items, since we need to provide "blank rows" for the items
   * that don't have a newsletter-info yet.
   */
  async model(params) {
    const meeting = await this.store.findRecord('meeting', params.meeting_id);
    const latestAgenda = await meeting.get('latestAgenda');
    const agendaItems = await this.store
      .query('agendaitem', {
        'filter[agenda][:id:]': latestAgenda.id,
        'filter[show-as-remark]': false,
        'filter[is-approval]': false,
        include: 'treatments.newsletter-info',
        sort: params.sort,
        'page[size]': 300,
      });
    return Promise.all(agendaItems.map(async(agendaItem) => ({
      agendaItem,
      newsletterInfo: await agendaItem.get('treatments.firstObject.newsletterInfo'),
    })));
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const meetingId = this.paramsFor('newsletter').meeting_id;
    const meeting = await this.store.findRecord('meeting', meetingId);
    const agenda = await meeting.get('latestAgenda');
    controller.set('agenda', agenda);

    controller.set('model', model);
  }

  @action
  refresh() {
    super.refresh();
  }
}
