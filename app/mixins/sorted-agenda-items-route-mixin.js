import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { hash } from 'rsvp';
import EmberObject from '@ember/object';

export default Mixin.create({
  sessionService: inject(),
  agendaService: inject(),

  async parseAgendaItems(agenda, session) {
    const agendaitems = (await agenda.get('agendaitems')).filter((item) => item);
    const agendaitemsToGroup = agendaitems.filter((item) => !item.get('showAsRemark'));
    await this.agendaService.assignDirtyPrioritiesToAgendaitems(agenda);
    const announcements = agendaitems.filter((item) => item.get('showAsRemark'));
    const groups = await this.agendaService.newSorting(session, agenda.get('id'));

    const previousAgenda = await this.sessionService.findPreviousAgendaOfSession(session, agenda);
    if (previousAgenda) {
      await this.agendaService.agendaWithChanges(agenda.get('id'), previousAgenda.get('id'));
    }
    const { lastPrio, firstAgendaItem } = await this.agendaService.parseGroups(
      groups,
      agendaitemsToGroup
    );
    const minutesApprovals = await Promise.all(
      agendaitems.map(async (agendaitem) => {
        const subcase = await agendaitem.get('subcase');
        if (!subcase && !agendaitem.get('showAsRemark')) {
          return agendaitem;
        }
      })
    );

    const minutesApproval = minutesApprovals.filter((item) => item).get('firstObject');
    const brokenAgendaItems = this.findBrokenAgendaItems(agendaitems, groups, minutesApproval, announcements);
    return {
      groups,
      firstAgendaItem,
      announcements,
      lastPrio,
      minutesApproval,
      brokenAgendaItems
    };
  },

  findBrokenAgendaItems(agendaitems, groups, minutesApproval, announcements) {
    const knownAgendaIds = {};
    if(groups){
      groups.map((result) => {
        result.groups.map((group) => {
          if(group.agendaitems) {
            group.agendaitems.map((agendaitem) => {
              knownAgendaIds[agendaitem.id] = true;
            });
          }
        });
      });
    }
    
    if(minutesApproval) {
      knownAgendaIds[minutesApproval.id] = true;
    }
    if(announcements) {
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
    const { groups, announcements, lastPrio, minutesApproval, brokenAgendaItems } = await this.parseAgendaItems(
      agenda,
      session,
      definite
    );

    const groupsArray = groups.map((item) => EmberObject.create(item));
    return hash({
      currentAgenda: agenda,
      groups: groupsArray,
      announcements,
      lastPrio,
      meeting: session,
      minutesApproval,
      brokenAgendaItems
    });
  },
});
