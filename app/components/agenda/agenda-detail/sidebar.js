import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { animationFrame } from 'ember-concurrency';
import { AgendaitemGroup } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class AgendaSidebar extends Component {
  /**
   * @argument notas
   * @argument announcements
   * @argument newItems: items to be marked as "new on this agenda"
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
