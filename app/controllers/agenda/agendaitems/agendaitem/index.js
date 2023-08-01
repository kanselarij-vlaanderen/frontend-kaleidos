import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reorderAgendaitemsOnAgenda } from 'frontend-kaleidos/utils/agendaitem-utils';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import { isPresent } from '@ember/utils';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service currentSession;
  @service router;
  @service agendaitemAndSubcasePropertiesSync;

  @controller('agenda.agendaitems') agendaitemsController;
  @controller('agenda') agendaController;
  @tracked meeting;
  @tracked agenda;
  @tracked agendaActivity;
  @tracked reverseSortedAgendas;
  @tracked subcase;
  @tracked submitter;
  @tracked newsItem;
  @tracked mandatees;
  @tracked decisionActivity;

  @tracked isEditingAgendaItemTitles = false;

  get isClosedMeeting() {
    return isPresent(this.meeting.agenda.get('id'));
  }

  async navigateToNeighbouringItem(agendaItemType, previousNumber) {
    // try transitioning to previous or next item, called on the delete of an agendaitem
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const neighbouringItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[type][:id:]': agendaItemType.id,
      'filter[number]': previousNumber, // Needs quotes because of bug in mu-cl-resources
    });
    if (neighbouringItem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem',
        this.meeting.id,
        this.agenda.id,
        neighbouringItem.id,
        { queryParams: { anchor: neighbouringItem.id}}
      );
    } else {
      // If there is no neighbour, we most likely just deleted the last and only agendaitem
      // In this case we should transition to the agenda overview
      this.router.transitionTo(
        'agenda.agendaitems',
        this.meeting.id,
        this.agenda.id,
        { queryParams: { anchor: null } }
      );
    }
  }

  async reassignNumbersForAgendaitems() {
    await reorderAgendaitemsOnAgenda(this.agenda, this.currentSession.may('manage-agendaitems'));
  }

  @action
  async reassignNumbersAndNavigateToNeighbouringAgendaitem(agendaItemType, previousNumber) {
    await this.reassignNumbersForAgendaitems();
    await this.navigateToNeighbouringItem(agendaItemType, previousNumber);
    // reload the agenda route, detail tab should no longer show if we deleted the last and only agendaitem
    // Also, if we deleted the first agendaitem, we should also reload the main route to reload <Agenda::agendaTabs>
    return this.router.refresh('agenda');
  }

  @action
  async toggleIsEditingAgendaItemTitles() {
    this.isEditingAgendaItemTitles = !this.isEditingAgendaItemTitles;
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.model,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
    this.agendaitemsController.groupNotasOnGroupName.perform();
  }

  exportPdf = task(async (report) => {
    const resp = await fetch(`/generate-decision-report/${report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  async replaceReportFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
    await report.save();
  }

  @action
  async saveSecretary(secretary) {
    this.decisionActivity.secretary = secretary;
    await this.decisionActivity.save();
    const report = await this.store.queryOne('report', {
      'filter[:has-no:next-piece]': true,
      'filter[decision-activity][:id:]': this.decisionActivity.id,
    });
    if (report) {
      const fileMeta = await this.exportPdf.perform(report);
      await this.replaceReportFile(report, fileMeta.id);
    }
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.subcase.save();
    setNotYetFormallyOk(this.model);
    await this.model.save();
  }
}
