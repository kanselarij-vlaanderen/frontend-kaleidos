import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class CasesCaseSubcasesSubcaseController extends Controller {
  @service router;
  @tracked decisionmakingFlow;
  @tracked siblingSubcasesCount;

  @action
  refreshSubcases() {
    this.router.refresh('cases.case.subcases');
  }

  @task
  *saveCase(_case) {
    yield _case.save();
  }
}
