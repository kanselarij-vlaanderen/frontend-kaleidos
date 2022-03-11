import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CasesCaseSubcasesOverviewController extends Controller {
  @service toaster;
  @service intl;

  @tracked case;

  @task
  *saveCase(caze) {
    yield caze.save();
  }

  @action
  refreshSubcases() {
    this.send('refreshParentModel');
  }
}
