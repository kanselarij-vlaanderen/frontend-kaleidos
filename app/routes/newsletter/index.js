import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class IndexNewsletterRoute extends Route {
  @service store;

  queryParams = {
    sort: {
      refreshModel: true,
    },
  };

  /* Although counterintuitive for a route named "newsletter", this model needs to
   * be centered around agenda-items, since we need to provide "blank rows" for the items
   * that don't have a newsletter-info yet.
   */
  async model(params) {
    const newsletterModel = this.modelFor('newsletter');
    const agenda = newsletterModel.agenda;
    let agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          ':id:': agenda.id,
        },
        'show-as-remark': false,
      },
      include: 'treatment.newsletter-info',
      sort: params.sort,
      'page[size]': PAGE_SIZE.AGENDAITEMS,
    });

    // The approval items should not be shown on newsletter views
    // Pre-Kaleidos items have undefined isApproval so can't be filtered in the query above
    agendaitems = agendaitems.filter((item) => item.isApproval !== true);

    return Promise.all(
      agendaitems.map(async (agendaitem) => {
        const agendaItemTreatment = await agendaitem.treatment;
        const newsletterItem = await agendaItemTreatment.newsletterInfo;
        return {
          agendaitem,
          newsletterItem,
        };
      })
    );
  }

  @action
  reloadModel() {
    super.refresh();
  }
}
