import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { saveChanges } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class CasesCaseSubcasesSubcaseOverviewController extends Controller {
  @service currentSession;

  get subcase() {
    return this.model;
  }
  @tracked allSubcases;
  @tracked mandatees;
  @tracked submitter;

  @tracked isEditingTitles = false;

  @action
  cancelEditing() {
    this.isEditingTitles = false;
  }

  @action
  toggleIsEditing() {
    this.isEditingTitles = !this.isEditingTitles;
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
    await saveChanges(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
  }
}
