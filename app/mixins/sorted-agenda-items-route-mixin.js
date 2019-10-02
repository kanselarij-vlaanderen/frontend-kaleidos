import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import EmberObject from '@ember/object';

export default Mixin.create({
  sessionService: inject(),
  agendaService: inject(),

  async parseAgendaItems(agenda, agendaitems, definite) {
    const announcements = agendaitems.filter((item) => item.showAsRemark);
    let draftAgendaitems = agendaitems.filter((item) => !item.showAsRemark);

    const sortedAgendaitems = await this.agendaService.getSortedAgendaItems(agenda);

    await this.agendaService.setGroupNameOnAgendaItems(draftAgendaitems);
    // this.assignDirtyPrioritiesToAgendaitems(draftAgendaitems, sortedAgendaitems);
    await this.agendaService.setCalculatedGroupPriorities(draftAgendaitems);

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
  findBrokenAgendaItems(agendaitems, groups, minutesApproval, announcements) {
    const knownAgendaIds = {};
    if (groups) {
      groups.map((result) => {
        result.groups.map((group) => {
          if (group.agendaitems) {
            group.agendaitems.map((agendaitem) => {
              knownAgendaIds[agendaitem.id] = true;
            });
          }
        });
      });
    }

    if (minutesApproval) {
      knownAgendaIds[minutesApproval.id] = true;
    }
    if (announcements) {
      announcements.map((announcement) => {
        knownAgendaIds[announcement.id] = true;
      });
    }

    return agendaitems.filter((agendaitem) => {
      return !knownAgendaIds[agendaitem.id];
    });
  },

  async model(params) {
    const definite = params.definite;
    const session = await this.modelFor('print-overviews');
    const agenda = await this.modelFor(`print-overviews.${this.type}`);
    let agendaitems = await this.store.query('agendaitem', {
      filter: { agenda: { id: agenda.get('id') } },
      include: 'mandatees',
    });
    const { draftAgendaitems, announcements, groupedAgendaitems } = await this.parseAgendaItems(
      agenda,
      agendaitems,
      definite
    );

    const groupsArray = groupedAgendaitems.map((item) => EmberObject.create(item));
    return hash({
      currentAgenda: agenda,
      groups: groupsArray.sortBy('groupPriority'),
      agendaitems: draftAgendaitems.sortBy('priority'),
      announcements: announcements.sortBy('priority'),
      meeting: session,
    });
  }
});
