import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcaseOverviewController extends Controller {
  @service sessionService;

  @alias('model') subcase;

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
}
