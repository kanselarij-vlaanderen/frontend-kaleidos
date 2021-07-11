import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
// import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';
import {
  setAgendaitemsPriority,
  AgendaitemGroup
} from 'frontend-kaleidos/utils/agendaitem-utils';
import {
  all,
  animationFrame
} from 'ember-concurrency';

export default class AgendaAgendaitemsController extends Controller {
  queryParams = [{
    filter: {
      type: 'string',
    },
    showModifiedOnly: {
      type: 'boolean',
    },
    anchor: {
      type: 'string',
    },
  }];

  @service sessionService;
  @service agendaService;
  @service router;
  @service intl;

  @lastValue('groupNotasOnGroupName') notaGroups = [];
  @tracked meeting;
  @tracked agenda;
  @tracked previousAgenda;
  @tracked selectedAgendaitem; // set in setupController of child-route
  @tracked documentLoadCount = 0;
  @tracked totalCount = 0;

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
    this.set('filter', value);
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

  @task
  *loadDocuments() {
    const agendaitems = [...this.model.notas, ...this.model.announcements];
    this.documentLoadCount = 0;
    this.totalCount = agendaitems.length;
    yield all(agendaitems.map(async(agendaitem) => {
      await this.store.findRecord('agendaitem', agendaitem.id, {
        reload: true, // without reload the async operation will be resolved too early by ember-data's cache,
        include: [
          'pieces',
          'pieces.document-container'
        ].join(','),
        'fields[pieces]': [
          'name', // Display and sorting pieces per agendaitem
          'document-container', // Deduplicating multiple pieces per container
          'created', // Fallback sorting pieces per agendaitem
          'confidential' // Display lock icon on document-badge
        ].join(','),
        'fields[document-containers]': '',
      });
      this.documentLoadCount++;
    }));
  }

  @action
  toggleShowModifiedOnly() {
    this.set('showModifiedOnly', !this.showModifiedOnly);
  }

  scrollToAnchor() {
    if (this.anchor) {
      const itemCardLink = this.element.querySelector(`a[href*='anchor=${this.anchor}']`);
      itemCardLink.scrollIntoView({
        block: 'nearest',
      });
    }
  }
}
