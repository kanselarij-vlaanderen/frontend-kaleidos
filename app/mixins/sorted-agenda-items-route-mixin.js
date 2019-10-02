import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import EmberObject from '@ember/object';

export default Mixin.create({
  sessionService: inject(),
  agendaService: inject(),

  async parseAgendaItems(agendaitems) {
    const announcements = agendaitems.filter((item) => item.showAsRemark);
    let draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark);

    await this.agendaService.setGroupNameOnAgendaItems(draftAgendaitems);
    await this.setCalculatedGroupPriorities(draftAgendaitems);

    const groupedAgendaitems = Object.values(this.groupAgendaitemsByGroupname(draftAgendaitems));
    return {
      draftAgendaitems,
      announcements,
      groupedAgendaitems,
    };
  },

  groupAgendaitemsByGroupname(agendaitems) {
    let groups = [];
    agendaitems.map((agendaitem) => {
      const groupName = agendaitem.get('groupName');
      const foundItem = groups.find((item) => item.groupName == groupName);

      if (!foundItem) {
        groups.push({
          groupName,
          groupPriority: agendaitem.groupPriority,
          agendaitems: [agendaitem],
        });
      } else {
        const foundIndex = groups.indexOf(foundItem);
        if (foundIndex) {
          groups[foundIndex].agendaitems.push(agendaitem);
        }
      }
    });
    return groups;
  },

  // TODO: check dead code
  // findBrokenAgendaItems(agendaitems, groups, minutesApproval, announcements) {
  //   const knownAgendaIds = {};
  //   if (groups) {
  //     groups.map((result) => {
  //       result.groups.map((group) => {
  //         if (group.agendaitems) {
  //           group.agendaitems.map((agendaitem) => {
  //             knownAgendaIds[agendaitem.id] = true;
  //           });
  //         }
  //       });
  //     });
  //   }

  //   if (minutesApproval) {
  //     knownAgendaIds[minutesApproval.id] = true;
  //   }
  //   if (announcements) {
  //     announcements.map((announcement) => {
  //       knownAgendaIds[announcement.id] = true;
  //     });
  //   }

  //   return agendaitems.filter((agendaitem) => {
  //     return !knownAgendaIds[agendaitem.id];
  //   });
  // },

  async model() {
    const session = await this.modelFor('print-overviews');
    const agenda = await this.modelFor(`print-overviews.${this.type}`);
    let agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agenda.get('id') } },
      include: 'mandatees',
    });
    const { draftAgendaitems, announcements, groupedAgendaitems } = await this.parseAgendaItems(
      agendaitems
    );

    let prevIndex = 0;
    const groupsArray = groupedAgendaitems
      .filter((group) => group.groupName && group.groupname != 'Geen toegekende ministers')
      .sortBy('groupPriority')
      .map((item) => {
        item.agendaitems.map((agendaitem, index) => {
          prevIndex = index + prevIndex + 1;
          agendaitem.itemIndex = prevIndex;
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
