import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexNewsletterRoute extends Route.extend(AuthenticatedRouteMixin) {
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
    const agenda = this.modelFor('newsletter').agenda; // eslint-disable-line
    const agendaitems = await this.store
      .query('agendaitem', {
        'filter[agenda][:id:]': agenda.id,
        'filter[show-as-remark]': false,
        'filter[is-approval]': false,
        include: 'treatments.newsletter-info',
        sort: params.sort,
        'page[size]': 300,
      });

    return Promise.all(agendaitems.map(async(agendaitem) => {
      const agendaItemTreatments = await agendaitem.get('treatments');
      const agendaItemTreatment = agendaItemTreatments.firstObject;
      const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
      return {
        agendaitem,
        newsletterInfo,
      };
    }));
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agenda = this.modelFor('newsletter').agenda; // eslint-disable-line
    controller.set('agenda', agenda);
    controller.set('model', model);
  }

  @action
  refresh() {
    super.refresh();
  }
}
