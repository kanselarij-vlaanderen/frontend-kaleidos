import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { animationFrame } from 'ember-concurrency';
import { A } from '@ember/array';

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

export default class AgendaSidebar extends Component {
  /**
   * @argument notas
   * @argument announcements
   */
  @tracked isShowingChanges = false;
  @tracked groupedNotas;
  @tracked isDesignAgenda;

  constructor() {
    super(...arguments);
    this.groupNotasOnGroupName.perform(this.args.notas);
    this.determineIfDesignAgenda.perform();
  }

  @task
  *groupNotasOnGroupName(agendaitems) {
    const agendaitemsArray = agendaitems.toArray();
    const agendaitemGroups = [];
    let currentAgendaitemGroup;
    for (const agendaitem of agendaitemsArray) {
      yield animationFrame(); // Computationally heavy task. This keeps the interface alive
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
