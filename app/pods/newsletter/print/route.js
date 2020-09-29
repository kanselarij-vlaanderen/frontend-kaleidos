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
    const notas = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark);

    if (params.showDraft) {
      const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);
      return hash({
        notas: notas.sortBy('priority'),
        announcements: announcements.sortBy('priority'),
      });
    } else { // eslint-disable-line no-else-return
      const filteredNotas = await this.filterAgendaitems(notas);

      // TODO: Below is a hacky way of grouping agendaitems for protocol order. Refactor.
      await setCalculatedGroupPriorities(notas);
      const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(notas));
      await this.agendaService.groupAgendaitemsOnGroupName(filteredNotas);

      return sortByPriority(groupedAgendaitems, true); // An array of groups
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('meeting', this.modelFor('newsletter').meeting);
    controller.set('agenda', this.modelFor('newsletter').agenda);
  }

  async filterAgendaitems(agendaitems) {
    const filteredAgendaitems = [];
    for (const agendaItem of agendaitems) {
      try {
        const agendaItemTreatment = await agendaItem.get('treatments').firstObject;
        const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
        if (newsletterInfo && newsletterInfo.inNewsletter) {
          filteredAgendaitems.push(agendaItem);
        }
      } catch (exception) {
        console.warn('An exception occurred: ', exception);
      }
    }
    return filteredAgendaitems;
  }
}
