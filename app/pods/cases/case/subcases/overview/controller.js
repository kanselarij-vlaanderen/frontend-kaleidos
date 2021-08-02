import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class CasesCaseSubcasesOverviewController extends Controller {
  @service toaster;
  @service intl;

  @tracked case;

  @task
  *addSubcase(subcase) {
    yield subcase.save();
    this.send('reloadModel');
  }

  @task
  *saveCase(caze) {
    yield caze.save();
  }
}
