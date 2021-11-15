import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { isEmpty } from '@ember/utils';

export default class IndexNewsletterRoute extends Route {
  @service currentSession;

  queryParams = {
    sort: {
      refreshModel: true,
    },
  };

  /* Although counterintuïtive for a route named "newsletter", this model needs to
   * be centered around agenda-items, since we need to provide "blank rows" for the items
   * that don't have a newsletter-info yet.
   */
  async model(params) {
    const agenda = this.modelFor('newsletter').agenda; // eslint-disable-line

    const filter = {
      'show-as-remark': false,
      agenda: {
        id: agenda.id,
      },
      ['is-approval']: false,
    };
    let agendaitems = await this.loadAgendaItems(params, filter);

    // KAS-2976 - Old Kaleidos items have undefined is-approval states and need to be queried for this view
    if (isEmpty(agendaitems)) {
      filter['is-approval'] = undefined;
      agendaitems = await this.loadAgendaItems(params, filter);
    }

    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        const agendaItemTreatments = await agendaitem.get('treatments');
        const agendaItemTreatment = agendaItemTreatments.firstObject;
        const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
        return {
          agendaitem,
          newsletterInfo,
        };
      })
    );
  }

  async afterModel() {
    this.agenda = this.modelFor('newsletter').agenda;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.agenda = this.agenda;
  }

  async loadAgendaItems(params, filter) {
    return await this.store.query('agendaitem', {
      filter,
      include: 'treatments.newsletter-info',
      sort: params.sort,
      'page[size]': PAGE_SIZE.AGENDAITEMS,
    });
  }

  @action
  refresh() {
    super.refresh();
  }
}
