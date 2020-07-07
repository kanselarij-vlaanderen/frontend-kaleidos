import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

export default class CompareAgendaList extends Component {
  /**
   * INFO arguments from parent.
   * @agendaToCompare=undefined
   * @currentAgenda type agenda
   * @isShowingChanges=undefined
   */

  @service store;
  @service sessionService;
  @service agendaService;
  @alias('agendaService.addedAgendaitems') addedAgendaitems;

  classNames = ['vlc-scroll-wrapper__body'];

  agendaToCompare = null;
  currentAgenda = null;
  currentAgendaGroups = null;
  agendaToCompareGroups = null;

  @tracked agendaOne = null;
  @tracked agendaTwo = null;
  @tracked isLoadingAgendaOne = null;
  @tracked isLoadingAgendaTwo = null;
  @tracked isLoadingComparison = null;

  @tracked agendaitemsLeft = null;
  @tracked agendaitemsRight = null;
  @tracked combinedItems = [] ;


  async bothAgendasSelected() {
    if (this.agendaOne && this.agendaTwo) {
      this.isLoadingComparison = true;

      const sortedAgendas = await this.sessionService.currentSession.sortedAgendas;
      let agendaOneIndex = sortedAgendas.indexOf(this.agendaOne);
      let agendaTwoIndex = sortedAgendas.indexOf(this.agendaTwo);

      if (agendaOneIndex < agendaTwoIndex) {
        await this.agendaService.agendaWithChanges(this.agendaOne.get('id'), this.agendaTwo.get('id'));
      } else {
        await this.agendaService.agendaWithChanges(this.agendaTwo.get('id'), this.agendaOne.get('id'));
      }

      this.combinedItems = await this.createComparisonList(this.agendaitemsLeft, this.agendaitemsRight);
      this.isLoadingComparison = false;
    }
  }


  @action
  async chooseAgendaOne(agenda) {
    this.isLoadingAgendaOne = true;
    const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
    await this.agendaService.groupAgendaItemsOnGroupName(agendaitems);

    this.agendaitemsLeft = agendaitems;
    this.agendaOne = agenda;
    this.isLoadingAgendaOne = false;
    await this.bothAgendasSelected();
  }

  @action
  async chooseAgendaTwo(agenda) {
    this.isLoadingAgendaTwo = true;
    const agendaitems = await this.getAgendaitemsFromAgenda(agenda.get('id'));
    await this.agendaService.groupAgendaItemsOnGroupName(agendaitems);

    this.agendaitemsRight = agendaitems;
    this.agendaTwo = agenda;
    this.isLoadingAgendaTwo = false;
    await this.bothAgendasSelected();
  }


  getAgendaitemsFromAgenda(id) {
    return this.store.query('agendaitem', {
      filter: {
        agenda: { id: id },
        'show-as-remark': false,
      },
      sort: 'priority',
      include: 'agenda,agenda-activity,agenda-activity.subcase,mandatees',
    });
  }

  async compareSubcase(left, right) {
    const leftAgendaActivity = await left.get('agendaActivity');
    let leftSubcaseId = null;
    if (leftAgendaActivity) {
      leftSubcaseId = await leftAgendaActivity.get('subcase.id');
    }
    const rightAgendaActivity = await right.get('agendaActivity');
    let rightSubcaseId = null;
    if (rightAgendaActivity) {
      rightSubcaseId = await rightAgendaActivity.get('subcase.id');
    }
    return leftSubcaseId == rightSubcaseId;
  }

  async createComparisonList(leftAgendaitems, rightAgendaitems) {
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

      if (this.addedAgendaitems.indexOf(currentRight.id) >= 0) {
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
  }

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
  }

  findItemBySubcase(item, list) {
    return list.find((possibleMatch) => possibleMatch.get('agendaActivity.subcase.id') == item.get('agendaActivity.subcase.id'));
  }
}
