import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import EmberObject from '@ember/object';
import {
  setCalculatedGroupPriorities,
  groupAgendaitemsByGroupname,
} from 'fe-redpencil/utils/agenda-item-utils';

export default Route.extend({
  type: 'decisions',

  async model() {
    const session = await this.modelFor('print-overviews');
    const agenda = await this.modelFor(`print-overviews.${this.type}`);
    let agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agenda.get('id') } },
      include: 'mandatees',
      sort: 'priority'
    });

    const announcements = agendaitems.filter((item) => {
      return item.showAsRemark;
    });

    const { draftAgendaitems, groupedAgendaitems } = await this.parseAgendaItems(agendaitems);

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

  async parseAgendaItems(agendaitems) {
    const draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark && !item.isApproval);

    await this.agendaService.groupAgendaItemsOnGroupName(draftAgendaitems);
    await setCalculatedGroupPriorities(draftAgendaitems);

    const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      groupedAgendaitems,
    };
  },

  queryParams: {
    definite: { refreshModel: false }
  }
});
