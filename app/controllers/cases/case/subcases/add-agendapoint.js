import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesCaseSubcasesAddAgendapointController extends Controller {
  @service router;

  @tracked decisionmakingFlow;
  @tracked mandatees;
  @tracked submitter;
  @tracked meeting;
  @tracked agenda;
  @tracked siblingSubcasesCount;
  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[3];

  @task
  *saveCase(_case) {
    yield _case.save();
  }

  @action
  refreshSubcases() {
    this.router.refresh('cases.case.subcases');
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }
}
