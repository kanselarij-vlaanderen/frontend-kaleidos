import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverviewController extends Controller {
  @tracked case;

  @task
  *saveCase(_case) {
    yield _case.save();
  }

  @action
  refreshSubcases() {
    this.send('refreshParentModel');
  }
}
