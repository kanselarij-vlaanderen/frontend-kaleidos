import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency';
import {
  setAgendaitemsNumber,
  AgendaitemGroup
} from 'frontend-kaleidos/utils/agendaitem-utils';
import {
  all,
  animationFrame
} from 'ember-concurrency';

export default class AgendaAgendaitemsController extends Controller {
  queryParams = [
    {
      filter: {
        type: 'string',
      },
      showModifiedOnly: {
        type: 'boolean',
      },
      anchor: {
        type: 'string',
      },
    },
  ];
  
  @service router;
  @service intl;
  @service throttledLoadingService;

  @lastValue('groupNotasOnGroupName') notaGroups = [];
  @tracked meeting;
  @tracked agenda;
  @tracked previousAgenda;
  @tracked selectedAgendaitem; // set in setupController of child-route
  @tracked documentLoadCount = 0;
  @tracked totalCount = 0;
  @tracked isLoading;
  @tracked isEditingOverview = false;

  // @tracked filter; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  // @tracked showModifiedOnly;
  // @tracked anchor;

  get id() {
    return guidFor(this);
  }

  get element() {
    return document.getElementById(this.id);
  }

  get isAgendaitemDetailRoute() {
    return this.router.currentRouteName.startsWith('agenda.agendaitems.agendaitem');
  }

  get documentLoadingMessage() {
    return this.intl.t('agendaitems-document-loading-progress-message', {
      count: this.documentLoadCount,
      total: this.totalCount,
    });
  }

  @action
  searchAgendaitems(value) {
    set(this,'filter', value);
  }

  @task
  *assignNewPriorities(reorderedAgendaitems, draggedAgendaItem) {
    const draggedAgendaItemType = yield draggedAgendaItem.type;
    // reorderedAgendaitems includes all items on the whole page. We only want to re-order within one category (nota/announcement/...)
    const reorderedAgendaitemsOfCategory =  [];
    for (const agendaitem of reorderedAgendaitems.toArray()) {
      const agendaItemType = yield agendaitem.type;
      if (agendaItemType.uri === draggedAgendaItemType.uri) {
        reorderedAgendaitemsOfCategory.push(agendaitem);
      }
    }
    yield setAgendaitemsNumber(reorderedAgendaitemsOfCategory, true, true); // permissions guarded in template (and backend)
    this.router.refresh('agenda.agendaitems');
  }

  @task
  *groupNotasOnGroupName() {
    const agendaitemsArray = this.model.notas.toArray();
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

  @task
  *loadDocuments() {
    const agendaitems = [...this.model.notas, ...this.model.announcements];
    this.documentLoadCount = 0;
    this.totalCount = agendaitems.length;
    yield all(agendaitems.map(async(agendaitem) => {
      await this.throttledLoadingService.loadPieces.perform(agendaitem);
      this.documentLoadCount++;
    }));
  }

  @action
  toggleShowModifiedOnly() {
    set(this,'showModifiedOnly', !this.showModifiedOnly);
  }

  scrollToAnchor() {
    if (this.anchor) {
      const itemCardLink = this.element?.querySelector(`a[href*='anchor=${this.anchor}']`);
      if (itemCardLink) {
        itemCardLink.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }
}
