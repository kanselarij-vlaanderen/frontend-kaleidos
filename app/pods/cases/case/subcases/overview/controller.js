import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';


export default class CaseSubcasesOverviewController extends Controller {
  @service toaster;
  @service intl;

  @task
  *saveSubcase(subcase) {
    yield subcase.save();
    this.toaster.success(this.intl.t('successfully-saved'));
    this.send('reloadModel');
  }

  @task
  *saveCase(caze) {
    yield caze.save();
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
