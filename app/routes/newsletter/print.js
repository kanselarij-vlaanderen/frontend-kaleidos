import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import {
  setCalculatedGroupNumbers,
  groupAgendaitemsByGroupname,
  sortByNumber
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PrintNewsletterRoute extends Route {
  queryParams = {
    showDraft: {
      refreshModel: true,
      as: 'klad',
    },
  }

  @service agendaService;
  @service store;

  async model(params) {
    const newsletterModel = this.modelFor('newsletter');
    const agenda = newsletterModel.agenda;
    let agendaitems = await this.store.query('agendaitem', {
      filter: {
        agenda: {
          ':id:': agenda.id,
        },
        'show-as-remark': params.showDraft ? false : undefined,
      },
      include: 'treatment.newsletter-info',
      sort: 'number',
      'page[size]': PAGE_SIZE.AGENDAITEMS,
    });

    // The approval items should not be shown on newsletter views
    // Pre-Kaleidos items have undefined isApproval so can't be filtered in the query above
    agendaitems = agendaitems.filter((item) => item.isApproval !== true);

    let notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    let announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    if (params.showDraft) {
      notas = notas.sortBy('number');
      announcements = announcements.sortBy('number');
    } else { // Items need to be ordered by minister protocol order
      // TODO: Below is a hacky way of grouping agendaitems for protocol order. Refactor.
      await setCalculatedGroupNumbers(notas);
      await this.agendaService.groupAgendaitemsOnGroupName(notas);
      const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(notas));

      const itemGroups = sortByNumber(groupedAgendaitems, true); // An array of groups
      notas = A([]);
      for (const group of itemGroups) {
        notas.addObjects(group.agendaitems);
      }
    }

    const newsItemMapper = async (agendaitem) => {
      const agendaItemTreatment = await agendaitem.treatment;
      const newsletterItem = await agendaItemTreatment.newsletterInfo;
      return {
        agendaitem,
        newsletterItem,
      };
    };

    const notasWithNewsItem = await Promise.all(notas.map(newsItemMapper));
    const announcementsWithNewsItem = await Promise.all(announcements.map(newsItemMapper));

    return hash({
      notas: notasWithNewsItem,
      announcements: announcementsWithNewsItem,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.meeting = this.modelFor('newsletter').meeting;
  }
}
