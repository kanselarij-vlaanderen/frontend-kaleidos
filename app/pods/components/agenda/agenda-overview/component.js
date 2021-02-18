import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';

class AgendaitemGroup {
  sortedMandatees;
  mandateeGroupId;
  agendaitems;

  constructor(mandatees, firstAgendaItem) {
    this.sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    this.mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(this.sortedMandatees);
    this.agendaitems = A([firstAgendaItem]);
  }

  static sortedMandatees(mandatees) {
    // Copy array by value. Manipulating the by-reference array would trigger changes when mandatees is an array from the store
    const copiedMandatees = A(mandatees.toArray());
    return copiedMandatees.sortBy('priority');
  }

  static generateMandateeGroupId(sortedMandatees) {
    // Assumes mandatees to be sorted
    return sortedMandatees.mapBy('id').join();
  }

  async itemBelongsToThisGroup(agendaitem) {
    const mandatees = await agendaitem.mandatees;
    const sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    const mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(sortedMandatees);
    return mandateeGroupId === this.mandateeGroupId;
  }
}

export default class AgendaOverview extends Component {
  /**
   * @argument notas
   * @argument announcements
   * @argument currentAgenda
   * @argument previousAgenda
   */
  @service sessionService;
  @service agendaService;

  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = null;
  @tracked showLoader = null;
  @tracked groupedNotas;
  @tracked isDesignAgenda;

  constructor() {
    super(...arguments);
    this.groupNotasOnGroupName.perform(this.args.notas);
    this.determineIfDesignAgenda.perform();
  }

  get isDraggingEnabled() {
    return this.currentSessionService.isEditor && this.isDesignAgenda;
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }

  @task
  *groupNotasOnGroupName(agendaitems) {
    const agendaitemsArray = agendaitems.toArray();
    const agendaitemGroups = [];
    let currentAgendaitemGroup;
    for (const agendaitem of agendaitemsArray) {
      if (currentAgendaitemGroup && (yield currentAgendaitemGroup.itemBelongsToThisGroup(agendaitem))) {
        currentAgendaitemGroup.agendaitems.pushObject(agendaitem);
      } else {
        const mandatees = yield agendaitem.get('mandatees');
        currentAgendaitemGroup = new AgendaitemGroup(mandatees, agendaitem);
        agendaitemGroups.push(currentAgendaitemGroup);
      }
    }
    this.groupedNotas = agendaitemGroups;
  }

  @task
  *determineIfDesignAgenda() {
    const agendaStatus = yield this.args.currentAgenda.status;
    this.isDesignAgenda = agendaStatus.isDesignAgenda;
  }
}
