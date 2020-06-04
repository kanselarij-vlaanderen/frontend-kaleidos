import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  store: inject(),
  sessionService: inject(),
  agendaService: inject(),
  addedAgendaitems: alias('agendaService.addedAgendaitems'),

  classNames: ['vlc-scroll-wrapper__body'],
  agendaToCompare: null,
  currentAgenda: null,
  currentAgendaGroups: null,
  agendaToCompareGroups: null,
  agendaOne: null,
  agendaTwo: null,

  isLoadingAgendaitems: computed(
    'isLoadingAgendaOne',
    'isLoadingAgendaTwo',
    'isLoadingComparison',
    function () {
      if (this.isLoadingAgendaOne || this.isLoadingAgendaTwo || this.isLoadingComparison) {
        return true;
      }
      return false;
    }
  ),

  bothAgendasSelectedObserver: observer('agendaOne.id', 'agendaTwo.id', async function () {
    const { agendaOne, agendaTwo, agendaitemsLeft, agendaitemsRight } = this;
    const bothAgendasSelected = agendaOne && agendaTwo;

    if (bothAgendasSelected) {
      this.set('isLoadingComparison', true);
      this.set('combinedItems', []);

      const sortedAgendas = await this.sessionService.currentSession.sortedAgendas;
      let agendaOneIndex = sortedAgendas.indexOf(agendaOne);
      let agendaTwoIndex = sortedAgendas.indexOf(agendaTwo);

      if (agendaOneIndex < agendaTwoIndex) {
        await this.agendaService.agendaWithChanges(agendaOne.get('id'), agendaTwo.get('id'));
      } else {
        await this.agendaService.agendaWithChanges(agendaTwo.get('id'), agendaOne.get('id'));
      }

      const newItems = await this.createComparisonList(agendaitemsLeft, agendaitemsRight);
      this.set('combinedItems', newItems);
      this.set('isLoadingComparison', false);
    }
  }),

  actions: {
    async chooseAgendaOne(agenda) {
      this.set('isLoadingAgendaOne', true);
      const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
      await this.agendaService.groupAgendaItemsOnGroupName(agendaitems);

      this.set('agendaitemsLeft', agendaitems);
      this.set('agendaOne', agenda);
      this.set('isLoadingAgendaOne', false);
    },
    async chooseAgendaTwo(agenda) {
      this.set('isLoadingAgendaTwo', true);
      const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
      await this.agendaService.groupAgendaItemsOnGroupName(agendaitems);

      this.set('agendaitemsRight', agendaitems);
      this.set('agendaTwo', agenda);
      this.set('isLoadingAgendaTwo', false);
    },
  },

  getAgendaitemsFromAgenda(id) {
    return this.store.query('agendaitem', {
      filter: {
        agenda: { id: id },
        'show-as-remark': false,
      },
      sort: 'priority',
      include: 'agenda,agenda-activity,agenda-activity.subcase,mandatees',
    });
  },

  async compareSubcase(left, right) {
    const leftSubcaseId = await left.get('subcase.id');
    const rightSubcaseId = await right.get('subcase.id');
    return leftSubcaseId == rightSubcaseId;
  },

  async createComparisonList(leftAgendaitems, rightAgendaitems) {
    const addedAgendaitems = this.get('addedAgendaitems');
    leftAgendaitems = [].concat(leftAgendaitems.toArray());
    rightAgendaitems = [].concat(rightAgendaitems.toArray());

    let combinedItems = [];
    let currentLeft, currentRight;

    while (leftAgendaitems.length || rightAgendaitems.length) {
      if (!currentLeft) {
        currentLeft = leftAgendaitems.shift();
      }
      if (!currentRight) {
        currentRight = rightAgendaitems.shift();
      }

      if (!currentLeft || !currentRight || (await this.compareSubcase(currentLeft, currentRight))) {
        combinedItems.push(EmberObject.create({ left: currentLeft, right: currentRight }));
        currentLeft = null;
        currentRight = null;
        continue;
      }

      if (addedAgendaitems.indexOf(currentRight.id) >= 0) {
        combinedItems.push(EmberObject.create({ left: null, right: currentRight }));
        currentRight = null;
        continue;
      }
      const foundLeftItem = this.findItemBySubcase(currentLeft, rightAgendaitems);

      if (!foundLeftItem) {
        combinedItems.push(EmberObject.create({ left: currentLeft, right: null }));
        currentLeft = null;
        continue;
      }

      const foundRightItem = this.findItemBySubcase(currentRight, leftAgendaitems);

      if (!foundRightItem) {
        combinedItems.push(EmberObject.create({ left: null, right: currentRight }));
        currentLeft = null;
        continue;
      }

      combinedItems.push(EmberObject.create({ left: currentLeft, right: currentRight }));
      currentLeft = null;
      currentRight = null;
    }
    return this.setCombinedGroupNames(combinedItems);
  },

  setCombinedGroupNames(list) {
    list.map((combinedItem) => {
      const leftGroupName = get(combinedItem, 'left.groupName');
      const rightGroupName = get(combinedItem, 'right.groupName');
      if (!leftGroupName && !rightGroupName) {
        return;
      }

      combinedItem.set('groupName', leftGroupName || rightGroupName);
    });
    return list;
  },

  findItemBySubcase(item, list) {
    return list.find((possibleMatch) => possibleMatch.get('subcase.id') == item.get('subcase.id'));
  },
});
