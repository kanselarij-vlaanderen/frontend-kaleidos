import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject } from '@ember/service';
import {
  setCalculatedGroupPriorities,
  groupAgendaitemsByGroupname,
  sortByPriority,
} from 'fe-redpencil/utils/agenda-item-utils';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),

  type: 'newsletter',
  allowEmptyGroups: true,

  queryParams: {
    definite: { refreshModel: true }
  },

  async model(params) {
    const session = await this.modelFor('print-overviews');
    const agenda = await this.modelFor(`print-overviews.${this.type}`);
    let agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agenda.get('id') } },
      include: 'mandatees',
      sort: 'priority'
    });
    const announcements = this.filterAnnouncements(agendaitems.filter((item) => {
      return item.showAsRemark;
    }), params);

    const { draftAgendaitems, groupedAgendaitems } = await this.parseAgendaItems(
      agendaitems, params
    );

    await this.agendaService.groupAgendaItemsOnGroupName(draftAgendaitems);

    const groupsArray = sortByPriority(groupedAgendaitems, this.allowEmptyGroups);

    return hash({
      currentAgenda: agenda,
      groups: groupsArray,
      agendaitems: draftAgendaitems.sortBy('priority'),
      announcements: announcements.sortBy('priority'),
      meeting: session,
    });
  },

  async parseAgendaItems(agendaitems, params) {
    let draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark && !item.isApproval);

    draftAgendaitems = await this.filterAgendaitems(draftAgendaitems, params);

    await setCalculatedGroupPriorities(draftAgendaitems);

    const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      groupedAgendaitems,
    };
  },

  filterAnnouncements: function (announcements) {
    return announcements.filter((item) => {
      return item.showInNewsletter;
    });
  },

  filterAgendaitems: async function (items, params) {
    if (params.definite !== 'true') {
      return items;
    }
    let newsLetterByIndex = await Promise.all(items.map(async (item) => {
      try {
        const agendaActivity = await item.get('agendaActivity');
        const subcase = await agendaActivity.get('subcase');
        const newsletterInfo = await subcase.get('newsletterInfo');
        return newsletterInfo.inNewsletter;
      } catch (e) {
        return false;
      }
    }));
    let filtered = [];
    items.map((item, index) => {
      if (newsLetterByIndex[index]) {
        filtered.push(item);
      }
    });
    return filtered;
  }
});
