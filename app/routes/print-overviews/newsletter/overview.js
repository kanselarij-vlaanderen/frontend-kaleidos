import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import {
  setCalculatedGroupPriorities,
  groupAgendaitemsByGroupname,
} from 'fe-redpencil/utils/agenda-item-utils';

export default Route.extend({
  sessionService: inject(),
  agendaService: inject(),

  type: 'newsletter',
  include: 'newsletter-info',

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

    let prevIndex = 0;
    let groupsArray = groupedAgendaitems;
    if (!this.allowEmptyGroups) {
      groupsArray = groupsArray.filter((group) => group.groupName && group.groupname != 'Geen toegekende ministers')
    } else {
      groupsArray = groupsArray.filter((group) => group.groupname != 'Geen toegekende ministers')
    }

    groupsArray = groupsArray.sortBy('groupPriority')
      .map((item) => {
        item.agendaitems.map((agendaitem, index) => {
          prevIndex = index + prevIndex + 1;
          agendaitem.set('itemIndex', prevIndex);
        });
        return EmberObject.create(item);
      });
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

    await this.agendaService.groupAgendaItemsOnGroupName(draftAgendaitems);
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

  allowEmptyGroups: true,

  filterAgendaitems: async function (items, params) {
    if (params.definite !== 'true') {
      return items;
    }
    let newsLetterByIndex = await Promise.all(items.map((item) => {
      if (!item) return;
      return item.get('subcase').then((subcase) => {
        if (!subcase) return;
        return subcase.get('newsletterInfo').then((newsletter) => {
          if (!newsletter) {
            return;
          }
          return newsletter.inNewsletter;
        });
      });
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
