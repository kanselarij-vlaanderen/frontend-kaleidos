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

  getComparedSortedAgendaItems(agenda) {
    return $.ajax({
      method: 'GET',
      url: `/agenda-sort/compared-sort?agendaId=${agenda.get('id')}`,
    }).then((result) => {
      return result.body.items;
    });
  },

  async assignDirtyPrioritiesToAgendaitems(selectedAgenda) {
    const sortedItems = await this.getSortedAgendaItems(selectedAgenda);
    const agendaitems = await selectedAgenda.get('agendaitems');
    agendaitems.map((agendaitem) => {
      if (agendaitem.get('subcase') && sortedItems) {
        const sortedAgendaItemFound = sortedItems.find(
          (sortedItem) => sortedItem.uuid == agendaitem.get('id')
        );
        if (sortedAgendaItemFound) {
          agendaitem.set('priority', sortedAgendaItemFound.priority);
        }
      }
    });
  },

  sendNewsletter(agenda) {
    return $.ajax({
      method: 'GET',
      url: `/newsletter/mails?agendaId=${agenda.get('id')}`,
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
      .catch((err) => {
        return;
      });
  },

  async createNewAgendaItem(selectedAgenda, subcase) {
    const mandatees = await subcase.get('mandatees');
    const titles = mandatees.map((mandatee) => mandatee.get('title'));
    const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`;

    const agendaitem = this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.get('shortTitle'),
      textPress: pressText,
      created: moment()
        .utc()
        .toDate(),
      subcase: subcase,
      agenda: selectedAgenda,
      title: subcase.get('title'),
      shortTitle: subcase.get('shortTitle'),
      formallyOk: CONFIG.notYetFormallyOk,
      showAsRemark: subcase.get('showAsRemark'),
      mandatees: mandatees,
      documentVersions: await subcase.get('documentVersions'),
      themes: await subcase.get('themes'),
      approvals: await subcase.get('approvals'),
    });
    return agendaitem.save();
  },

  parseGroups(groups, agendaitems) {
    let lastPrio = 0;
    let firstAgendaItem;
    groups.map((agenda) => {
      agenda.groups.map((group) => {
        const newAgendaitems = group.agendaitems.map((item) => {
          const foundItem = agendaitems.find((agendaitem) => item.id === agendaitem.get('id'));

          if (!firstAgendaItem) {
            firstAgendaItem = foundItem;
          }
          if (foundItem && foundItem.get('priority')) {
            lastPrio = foundItem.priority;
          } else {
            if (foundItem) {
              foundItem.set('priority', parseInt(lastPrio) + 1);
            }
          }

          return foundItem;
        });
        group.agendaitems = newAgendaitems.filter((item) => item).sortBy('priority');

        if (group.agendaitems.get('length') < 1) {
          group.agendaitems = 0;
          group = null;
        }
      });
    });
    return { lastPrio, firstAgendaItem };
  },

  async reduceComparison(combinedAgendaItems) {
    return this.groupComparisonByMandatee(
      combinedAgendaItems
        .map((combinedItem) => this.addExtraAgendaItemProperties(combinedItem))
        .filter((combinedItem) => combinedItem.left || combinedItem.right)
        .sort((a, b) => (a.left && b.left ? a.left.priority - b.left.priority : 1))
    );
  },

  setExtraAgendaItemProperties(agendaitem) {
    let { minPriority, mandatees } = this.createMandateeListWithPriorities(agendaitem);

    if (mandatees && mandatees !== []) {
      return {
        groupName: mandatees
          .map((mandatee) => `${mandatee.title} (${mandatee.priority})`)
          .join(', '),
        groupPrio: minPriority,
        mandatees: mandatees,
        agendaitem: agendaitem,
        priority: agendaitem.priority,
      };
    }
  },

  createMandateeListWithPriorities(agendaitem) {
    let mandatees = agendaitem.get('subcase.mandatees');
    let priorities = [];
    let minPriority = 0;
    if (mandatees) {
      mandatees = mandatees.sortBy('priority');
      priorities = mandatees.map((item) => parseInt(item.priority));
      minPriority = Math.min(...priorities);
    }
    return { minPriority, mandatees };
  },

  addExtraAgendaItemProperties(agendaitem) {
    const { left, right } = agendaitem;
    let mappedLeft, mappedRight;
    if (left) {
      mappedLeft = this.setExtraAgendaItemProperties(left);
    }
    if (right) {
      mappedRight = this.setExtraAgendaItemProperties(right);
    }
    return { left: mappedLeft, right: mappedRight };
  },

  groupComparisonByMandatee(comparison) {
    return comparison.reduce((groups, combinedItem) => {
      const leftGroupOfCombinedItem = combinedItem.left ? combinedItem.left.groupName : null;
      const rightGroupOfCombinedItem = combinedItem.right ? combinedItem.right.groupName : null;
      const group = {
        leftGroupName: leftGroupOfCombinedItem,
        rightGroupName: rightGroupOfCombinedItem,
        agendaitems: [combinedItem],
      };
      if (leftGroupOfCombinedItem === rightGroupOfCombinedItem) {
        this.addToGroups(
          groups,
          {
            ...group,
            isSame: true,
          },
          (group) => group.leftGroupName === leftGroupOfCombinedItem
        );
      } else if (leftGroupOfCombinedItem) {
        this.addToGroups(
          groups,
          {
            ...group,
            isSame: false,
          },
          (group) => group.leftGroupName === leftGroupOfCombinedItem
        );
      } else {
        this.addToGroups(
          groups,
          {
            ...group,
            isSame: false,
          },
          (group) => group.rightGroupName === rightGroupOfCombinedItem
        );
      }
      return groups;
    }, []);
  },

  addToGroups(groups, group, compareFunc) {
    const foundGroup = groups.find(compareFunc);
    if (!foundGroup) {
      groups.push(group);
    } else {
      foundGroup.agendaitems.push(...group.agendaitems);
    }
  },
});
