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
    const agenda = await this.modelFor('newsletter').agenda;
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': params.showDraft ? false : undefined,
      'filter[is-approval]': false,
      include: 'mandatees,treatment.newsletter-info',
      sort: 'number',
      'page[size]': PAGE_SIZE.AGENDAITEMS,
    });
    let notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    let announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    if (params.showDraft) {
      notas = notas.sortBy('number');
      announcements = announcements.sortBy('number');
    } else { // Items need to be ordered by minister protocol order
      const filteredNotas = await this.filterAgendaitems(notas);

      // TODO: Below is a hacky way of grouping agendaitems for protocol order. Refactor.
      await setCalculatedGroupNumbers(notas);
      await this.agendaService.groupAgendaitemsOnGroupName(filteredNotas);
      const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(notas));

      const itemGroups = sortByNumber(groupedAgendaitems, true); // An array of groups
      notas = A([]);
      for (const group of itemGroups) {
        notas.addObjects(group.agendaitems);
      }
    }

    return hash({
      notas,
      announcements,
    });
  }

  async afterModel() {
    const meeting = this.modelFor('newsletter').meeting;
    this.meeting = await this.store.queryOne('meeting', {
      'filter[:uri:]': meeting.uri,
      include: [
        'internal-document-publication-activity',
        'themis-publication-activities'
      ].join(','),
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('meeting', this.meeting);
  }

  async filterAgendaitems(agendaitems) {
    const filteredAgendaitems = [];
    for (const agendaitem of agendaitems) {
      try {
        const agendaItemTreatment = await agendaitem.treatment;
        const newsletterInfo = await agendaItemTreatment?.newsletterInfo;
        if (newsletterInfo && newsletterInfo.inNewsletter) {
          filteredAgendaitems.push(agendaitem);
        }
      } catch (exception) {
        console.warn('An exception occurred: ', exception);
      }
    }
    return filteredAgendaitems;
  }
}
