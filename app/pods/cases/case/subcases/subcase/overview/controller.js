import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { saveChanges } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class CasesCaseSubcasesSubcaseOverviewController extends Controller {
  @service sessionService;

  @alias('model') subcase;
  @tracked allSubcases;
  @tracked governmentFields;

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
  setConfidentiality(isConfidential) {
    this.subcase.set('confidential', isConfidential);
    // TODO: save?
  }

  @action
  async saveMandateeData(mandateeData) {
    // fields to ise
    let correspondingIseCodes = [];
    if (mandateeData.fields.length) {
      correspondingIseCodes = await this.store.query('ise-code', {
        'filter[field][:id:]': mandateeData.fields.map((field) => field.id).join(','),
      });
    }
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
      iseCodes: correspondingIseCodes,
    };
    await saveChanges(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
  }
}
