import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
import EmberObject from '@ember/object';

export default Service.extend({
  store: inject(),
  addedDocuments: null,
  addedAgendaitems: null,

  assignNewSessionNumbers() {
    return $.ajax({
      method: 'GET',
      url: `/session-service/assignNewSessionNumbers`,
    });
  },

  getClosestMeetingAndAgendaId(date) {
    return $.ajax({
      method: 'GET',
      url: `/session-service/closestMeeting?date=${date}`,
    }).then((result) => {
      return result.body.closestMeeting;
    });
  },

  getClosestMeetingAndAgendaIdInTheFuture(date) {
    return $.ajax({
      method: 'GET',
      url: `/session-service/closestFutureMeeting?date=${date}`,
    }).then((result) => {
      return result.body.closestMeeting;
    });
  },

  getSortedAgendaItems(agenda) {
    return $.ajax({
      method: 'GET',
      url: `/agenda-sort?agendaId=${agenda.get('id')}`,
    }).then((result) => {
      return result.body.items;
    });
  },

  approveAgendaAndCopyToDesignAgenda(currentSession, oldAgenda) {
    let newAgenda = this.store.createRecord('agenda', {
      name: 'Ontwerpagenda',
      createdFor: currentSession,
      created: moment()
        .utc()
        .toDate(),
      modified: moment()
        .utc()
        .toDate(),
    });

    return newAgenda
      .save()
      .then((agenda) => {
        if (oldAgenda) {
          return $.ajax({
            method: 'POST',
            url: '/agenda-approve/approveAgenda',
            data: {
              newAgendaId: agenda.id,
              oldAgendaId: oldAgenda.id,
            },
          });
        } else {
          notifyPropertyChange(agenda, 'agendaitems');
          return agenda;
        }
      })
      .then(() => {
        notifyPropertyChange(newAgenda, 'agendaitems');
        return newAgenda;
      });
  },

  sortAgendaItems(selectedAgenda) {
    return $.ajax({
      method: 'POST',
      url: `/agenda-sort?agendaId=${selectedAgenda.get('id')}`,
      data: {},
    }).then(() => {
      notifyPropertyChange(selectedAgenda, 'agendaitems');
    });
  },

  newSorting(sessionId, currentAgendaID) {
    return $.ajax({
      method: 'GET',
      url: `/agenda-sort/sortedAgenda?sessionId=${sessionId.get(
        'id'
      )}&selectedAgenda=${currentAgendaID}`,
    }).then((result) => {
      return result.map((item) => {
        item.groups = item.groups.map((group) => EmberObject.create(group));
        return EmberObject.create(item);
      });
    });
  },

  agendaWithChanges(currentAgendaID, agendaToCompareID) {
    return $.ajax({
      method: 'GET',
      url: `/agenda-sort/agenda-with-changes?agendaToCompare=${agendaToCompareID}&selectedAgenda=${currentAgendaID}`,
    })
      .then((result) => {
        this.set('addedDocuments', result.addedDocuments);
        this.set('addedAgendaitems', result.addedAgendaitems);
        return result;
      })
      .catch(() => {
        return;
      });
  },

  async createNewAgendaItem(selectedAgenda, subcase, index) {
    let priorityToAssign = 0;
    const mandatees = await subcase.get('mandatees');
    const titles = mandatees.map((mandatee) => mandatee.get('title'));
    const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`;
    const isAnnouncement = subcase.get('showAsRemark');
    if (isAnnouncement) {
      priorityToAssign = (await selectedAgenda.get('lastAnnouncementPriority')) + 1;
    } else {
      priorityToAssign = (await selectedAgenda.get('lastAgendaitemPriority')) + 1;
    }

    if (isNaN(priorityToAssign)) {
      priorityToAssign = 1;
    }

    if(index) {
      priorityToAssign += index;
    }
    const agendaitem = this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.get('shortTitle'),
      textPress: pressText,
      created: moment()
        .utc()
        .toDate(),
      subcase: subcase,
      priority: priorityToAssign,
      agenda: selectedAgenda,
      title: subcase.get('title'),
      shortTitle: subcase.get('shortTitle'),
      formallyOk: CONFIG.notYetFormallyOk,
      showAsRemark: isAnnouncement,
      mandatees: mandatees,
      documentVersions: await subcase.get('documentVersions'),
      linkedDocumentVersions: await subcase.get('linkedDocumentVersions'),
      themes: await subcase.get('themes'),
      approvals: await subcase.get('approvals'),
    });
    return agendaitem.save();
  },

  /**
   * Dirty calculation to fix the priorities of a mandateeGroup.
   * This should be done in the backend using queries.
   */
  setCalculatedGroupPriorities(agendaitems) {
    return Promise.all(agendaitems.map(async (item) => {
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
      })
      item.set('groupPriority', calculatedGroupPriority);
    }));
  },


  async setGroupNameOnAgendaItems(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(agendaitems.map(async (item) => {
      const mandatees = await item.get('mandatees');
      if (item.isApproval) {
        item.set('groupName', null);
        return;
      }
      if (mandatees.length == 0) {
        item.set('groupName', 'Geen toegekende ministers');
        return;
      }
      const currentAgendaitemGroupName = mandatees.map((mandatee) => mandatee.title).join('<br/>');
      
      if (currentAgendaitemGroupName != previousAgendaitemGroupName) {
        previousAgendaitemGroupName = currentAgendaitemGroupName;
        item.set('groupName', currentAgendaitemGroupName);
      } else {
        item.set('groupName', null);
      }

    }));
  },
});
