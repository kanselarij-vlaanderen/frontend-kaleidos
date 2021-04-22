import Controller, { inject as controller } from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';
import {
  setAgendaitemsPriority,
  AgendaitemGroup
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { animationFrame } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class AgendaitemsAgendaController extends Controller {
  queryParams = [{
    anchor: {
      type: 'string',
    },
  }];

  @service sessionService;
  @service agendaService;

  // @tracked anchor; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  @tracked filter;
  @tracked showModifiedOnly;

  @lastValue('groupNotasOnGroupName') notaGroups = [];
  @tracked meeting;
  @tracked agenda;
  @tracked previousAgenda;

  @controller('agenda.agendaitems') agendaitemsController;

  get id() {
    return guidFor(this);
  }

  get element() {
    return document.getElementById(this.id);
  }

  @action
  searchAgendaitems(value) {
    set(this.agendaitemsController, 'filter', value);
  }

  @task
  *assignNewPriorities(reorderedAgendaitems, draggedAgendaItem) {
    // reorderedAgendaitems includes all items on the whole page. We only want to re-order within one category (nota/announcement/...)
    const reorderedAgendaitemsOfCategory = reorderedAgendaitems.filter((item) => item.showAsRemark === draggedAgendaItem.showAsRemark);
    yield setAgendaitemsPriority(reorderedAgendaitemsOfCategory, true, true); // permissions guarded in template (and backend)
    this.send('reloadModel');
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
    return agendaitemGroups;
  }

  @action
  toggleShowModifiedOnly() {
    set(this.agendaitemsController, 'showModifiedOnly', !this.agendaitemsController.showModifiedOnly);
  }

  scrollToAnchor() {
    if (this.anchor) {
      const itemCardLink = this.element.querySelector(`a[href*='anchor=${this.anchor}']`);
      itemCardLink.scrollIntoView({
        block: 'center',
      });
    }
  }
}
