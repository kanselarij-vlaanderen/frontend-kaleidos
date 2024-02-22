import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcasesController extends Controller {
  @service router;

  @tracked decisionmakingFlow;
  @tracked selectedSubcase;

  @task
  *saveCase(_case) {
    yield _case.save();
  }

  @action
  refreshSubcases() {
    this.router.refresh('cases.case.subcases');
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }
}
