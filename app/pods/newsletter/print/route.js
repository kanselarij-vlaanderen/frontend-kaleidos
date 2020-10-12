import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject } from '@ember/service';
import {
  setCalculatedGroupPriorities,
  groupAgendaitemsByGroupname,
  sortByPriority
} from 'fe-redpencil/utils/agendaitem-utils';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),

  type: 'newsletter',
  allowEmptyGroups: true,

  queryParams: {
    definite: {
      refreshModel: true,
    },
  },

  async model(params) {
    const session = await this.modelFor('newsletter').meeting;
    const agenda = await this.modelFor('newsletter').agenda;
    const agendaitems = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': params.definite ? undefined : false,
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
      currentAgenda: agenda,
      groups: groupsArray,
      agendaitems: draftAgendaitems.sortBy('priority'),
      announcements: announcements.sortBy('priority'),
      meeting: session,
    });
  },

  async parseAgendaitems(agendaitems, params) {
    let draftAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isApproval);

    draftAgendaitems = await this.filterAgendaitems(draftAgendaitems, params);

    await setCalculatedGroupPriorities(draftAgendaitems);
    await this.agendaService.groupAgendaItemsOnGroupName(draftAgendaitems);
    const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      groupedAgendaitems,
    };
  },

  filterAnnouncements(announcements) {
    return announcements.filter((agendaitem) => agendaitem.showInNewsletter);
  },

  async filterAgendaitems(agendaitems, params) {
    if (params.definite !== 'true') {
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
  },
});
