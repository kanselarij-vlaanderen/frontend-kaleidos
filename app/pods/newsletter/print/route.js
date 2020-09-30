import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import {
  setCalculatedGroupPriorities,
  groupAgendaitemsByGroupname,
  sortByPriority
} from 'fe-redpencil/utils/agendaitem-utils';

export default class PrintNewsletterRoute extends Route {
  queryParams = {
    showDraft: {
      refreshModel: true,
      as: 'klad',
    },
  }

  @service sessionService;
  @service agendaService;

  async model(params) {
    const agenda = await this.modelFor('newsletter').agenda;
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': params.showDraft ? false : undefined,
      'filter[is-approval]': false,
      include: 'mandatees,treatments.newsletter-info',
      sort: 'priority',
      'page[size]': 300,
    });
    let notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);
    let announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);

    if (params.showDraft) {
      notas = notas.sortBy('priority');
      announcements = announcements.sortBy('priority');
    } else { // Items need to be ordered by minister protocol order
      const filteredNotas = await this.filterAgendaitems(notas);

      // TODO: Below is a hacky way of grouping agendaitems for protocol order. Refactor.
      await setCalculatedGroupPriorities(notas);
      const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(notas));
      await this.agendaService.groupAgendaitemsOnGroupName(filteredNotas);

      const itemGroups = sortByPriority(groupedAgendaitems, true); // An array of groups
      notas = itemGroups.reduce((agendaitems, group) => agendaitems.push(group.agendaitems));
    }

    return hash({
      notas,
      announcements,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('meeting', this.modelFor('newsletter').meeting);
  }

  async filterAgendaitems(agendaitems) {
    const filteredAgendaitems = [];
    for (const agendaitem of agendaitems) {
      try {
        const agendaItemTreatment = await agendaitem.get('treatments').firstObject;
        const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
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
