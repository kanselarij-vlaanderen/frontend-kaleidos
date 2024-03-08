import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesAddSubcaseController extends Controller {
  @tracked decisionmakingFlow;
  @tracked latestSubcase;
  @service router;

  @action
  onCreateSubcase() {
    this.router.refresh('cases.case.subcases');
  }
}
