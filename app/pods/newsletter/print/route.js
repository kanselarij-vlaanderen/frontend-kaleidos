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

  allowEmptyGroups = true;

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
    const announcements = this.filterAnnouncements(agendaitems.filter((agendaitem) => agendaitem.showAsRemark), params);

    const {
      draftAgendaitems, groupedAgendaitems,
    } = await this.parseAgendaitems(
      agendaitems, params
    );

    await this.agendaService.groupAgendaitemsOnGroupName(draftAgendaitems);

    const groupsArray = sortByPriority(groupedAgendaitems, this.allowEmptyGroups);

    return hash({
      groups: groupsArray,
      agendaitems: draftAgendaitems.sortBy('priority'),
      announcements: announcements.sortBy('priority'),
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('meeting', this.modelFor('newsletter').meeting);
    controller.set('agenda', this.modelFor('newsletter').agenda);
  }

  async parseAgendaitems(agendaitems, params) {
    let draftAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isApproval);

    draftAgendaitems = await this.filterAgendaitems(draftAgendaitems, params);

    await setCalculatedGroupPriorities(draftAgendaitems);

    const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      groupedAgendaitems,
    };
  },

  filterAnnouncements(announcements) {
    return announcements.filter((agendaitem) => agendaitem.showInNewsletter);
  }

  async filterAgendaitems(agendaitems, params) {
    if (params.showDraft) {
      return agendaitems;
    }
    const newsLetterByIndex = await Promise.all(agendaitems.map(async(agendaitem) => {
      try {
        const agendaItemTreatment = await agendaitem.get('treatments').firstObject;
        const newsletterInfo = await agendaItemTreatment.get('newsletterInfo');
        return newsletterInfo.inNewsletter;
      } catch (exception) {
        console.warn('An exception occurred: ', exception);
        return false;
      }
    }));
    const filtered = [];
    agendaitems.map((agendaitem, index) => {
      if (newsLetterByIndex[index]) {
        filtered.push(agendaitem);
      }
      return null;
    });
    return filtered;
  }
}
