import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, lastValue, all, animationFrame } from 'ember-concurrency';
import {
  setAgendaitemsNumber,
  AgendaitemGroup
} from 'frontend-kaleidos/utils/agendaitem-utils';

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
  
  @service store;
  @service router;
  @service intl;
  @service decisionReportGeneration;
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

  @tracked filter;
  @tracked notasHasChanged = false;
  @tracked announcementsHasChanged = false;

  constructor() {
    super(...arguments);

    this.router.on('routeWillChange', (transition) => {
      if (this.notasHasChanged || this.announcementsHasChanged) {
        if (!transition.isAborted) {
          if (confirm(this.intl.t('leave-unsaved-changed'))) {
            this.isEditingOverview = false;
            this.notasHasChanged = false;
            this.announcementsHasChanged = false;
          } else {
            transition.abort();
            if (transition.to.name !== 'agenda.agendaitems.index') {
              history.forward();
            }
          }
        }
      }
    });
  }

  get id() {
    return guidFor(this);
  }

  get element() {
    return document.getElementById(this.id);
  }

  get isAgendaitemDetailRoute() {
    return this.router.currentRouteName.startsWith(
      'agenda.agendaitems.agendaitem'
    );
  }

  get documentLoadingMessage() {
    return this.intl.t('agendaitems-document-loading-progress-message', {
      count: this.documentLoadCount,
      total: this.totalCount,
    });
  }

  @action
  startEditingOverview() {
    this.isEditingOverview = true;
  }

  @action
  searchAgendaitems(value) {
    this.filter = value;
  }

  @task
  *assignNewPriorities(reorderedAgendaitems) {
    yield setAgendaitemsNumber(
      reorderedAgendaitems,
      this.meeting,
      this.store,
      this.decisionReportGeneration,
      true,
      true
    ); // permissions guarded in template (and backend)
    this.notasHasChanged = false;
    this.announcementsHasChanged = false;
    this.router.refresh('agenda.agendaitems');
  }

  @task
  *groupNotasOnGroupName() {
    const agendaitemsArray = this.model.notas.slice();
    const agendaitemGroups = [];
    let currentAgendaitemGroup;
    for (const agendaitem of agendaitemsArray) {
      yield animationFrame(); // Computationally heavy task. This keeps the interface alive
      if (
        currentAgendaitemGroup &&
        (yield currentAgendaitemGroup.itemBelongsToThisGroup(agendaitem))
      ) {
        currentAgendaitemGroup.agendaitems.pushObject(agendaitem);
      } else {
        const mandatees = yield agendaitem.get('mandatees');
        currentAgendaitemGroup = new AgendaitemGroup(mandatees, agendaitem);
        agendaitemGroups.push(currentAgendaitemGroup);
      }
    }
    return agendaitemGroups;
  }

  loadDocuments = task(async () => {
    const agendaitems = [...this.model.notas, ...this.model.announcements];
    this.documentLoadCount = 0;
    this.totalCount = agendaitems.length;
    await all(
      agendaitems.map(async (agendaitem) => {
        await this.throttledLoadingService.loadPieces.perform(agendaitem);
        // Negates unreproducible issue (KAS-4219)
        if (this.documentLoadCount < this.totalCount) {
          this.documentLoadCount++;
        }
      })
    );
  });

  @action
  toggleShowModifiedOnly() {
    set(this, 'showModifiedOnly', !this.showModifiedOnly);
  }

  scrollToAnchor() {
    if (this.anchor) {
      const itemCardLink = this.element?.querySelector(
        `a[href*='anchor=${this.anchor}']`
      );
      if (itemCardLink) {
        itemCardLink.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }
}
