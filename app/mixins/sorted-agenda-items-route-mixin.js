import Mixin from '@ember/object/mixin';
import {inject} from '@ember/service';
import {hash} from 'rsvp';
import EmberObject from '@ember/object';

export default Mixin.create({
  sessionService: inject(),
  agendaService: inject(),

  async parseAgendaItems(agendaitems, params) {
    let draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark && !item.isApproval);

    draftAgendaitems = await this.filterAgendaitems(draftAgendaitems, params);

    await this.agendaService.groupAgendaItemsOnGroupName(draftAgendaitems);
    await this.setCalculatedGroupPriorities(draftAgendaitems);

    const groupedAgendaitems = Object.values(this.groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      groupedAgendaitems,
    };
  },

  groupAgendaitemsByGroupname(agendaitems) {
    let groups = [];
    agendaitems.map((agendaitem) => {
      const groupName = agendaitem.get('ownGroupName');
      const foundItem = groups.find((item) => item.groupName == groupName);

      if (!foundItem) {
        groups.push({
          groupName,
          groupPriority: agendaitem.groupPriority,
          agendaitems: [agendaitem],
        });
      } else {
        const foundIndex = groups.indexOf(foundItem);
        if (foundIndex >= 0) {
          groups[foundIndex].agendaitems.push(agendaitem);
        }
      }
    });
    return groups;
  },

  filterAnnouncements: function (items) {
    return items;
  },

  filterAgendaitems: async function (items) {
    return items;
  },

  async model(params) {
    const session = await this.modelFor('print-overviews');
    const agenda = await this.modelFor(`print-overviews.${this.type}`);
    let agendaitems = await this.store.query('agendaitem', {
      filter: {agenda: {id: agenda.get('id')}},
      include: 'mandatees',
      sort: "priority"
    });
    const announcements = this.filterAnnouncements(agendaitems.filter((item) => {
      return item.showAsRemark;
    }), params);

    const {draftAgendaitems, groupedAgendaitems} = await this.parseAgendaItems(
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

  /**
   * Dirty calculation to fix the priorities of a mandateeGroup.
   * This should be done in the backend using queries.
   */
  setCalculatedGroupPriorities(agendaitems) {
    return Promise.all(
      agendaitems.map(async (item) => {
        const mandatees = await item.get('mandatees');
        if (item.isApproval) {
          return;
        }
        if (mandatees.length == 0) {
          item.set('groupPriority', 20000000);
          return;
        }
        const mandateePriorities = mandatees.map((mandatee) => mandatee.priority);
        const minPrio = Math.min(...mandateePriorities);
        const minPrioIndex = mandateePriorities.indexOf(minPrio);
        delete mandateePriorities[minPrioIndex];
        let calculatedGroupPriority = minPrio;
        mandateePriorities.forEach((value) => {
          calculatedGroupPriority += value / 100;
        });
        item.set('groupPriority', calculatedGroupPriority);
      })
    );
  },
});
