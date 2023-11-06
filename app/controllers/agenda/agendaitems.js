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
import generateReportName from 'frontend-kaleidos/utils/generate-report-name';

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
    this.filter = value;
  }

  @task
  *assignNewPriorities(reorderedAgendaitems, draggedAgendaItem) {
    const draggedAgendaItemNumber = draggedAgendaItem.number;
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
    const newDraggedAgendaItemNumber = draggedAgendaItem.number;

    const needNewReports = reorderedAgendaitemsOfCategory.slice(
      Math.min(draggedAgendaItemNumber, newDraggedAgendaItemNumber) - 1, // number is 1-indexed
      Math.max(draggedAgendaItemNumber, newDraggedAgendaItemNumber), // slice does not include end index
    );
    if (needNewReports) {
      const reports = [];
      yield Promise.all(needNewReports.map(async (agendaitem) => {
        const report = await this.store.queryOne('report', {
          'filter[:has-no:next-piece]': true,
          'filter[:has:piece-parts]': true,
          'filter[decision-activity][treatment][agendaitems][:id:]': agendaitem.id,
        });
        reports.push(report);
        report.name = await generateReportName(agendaitem, this.meeting);
        return report.save();
      }));
      this.decisionReportGeneration.generateReplacementReports.perform(reports);
    }
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

  loadDocuments = task(async () => {
    const agendaitems = [...this.model.notas, ...this.model.announcements];
    this.documentLoadCount = 0;
    this.totalCount = agendaitems.length;
    await all(agendaitems.map(async(agendaitem) => {
      await this.throttledLoadingService.loadPieces.perform(agendaitem);
      // Negates unreproducible issue (KAS-4219)
      if (this.documentLoadCount < this.totalCount) {
        this.documentLoadCount++;
      }
    }));
  });

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
