import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class CasesCaseSubcasesDemoSubcaseDemoController extends Controller {
  @service router;
  @tracked decisionmakingFlow;
  @tracked siblingSubcasesCount;
  @tracked currentRoute = this.router.currentRouteName;

  constructor() {
    super(...arguments);
    this.router.on('routeDidChange', () => {
      this.currentRoute = this.router.currentRouteName;
    });
  }

  @action
  refreshSubcases() {
    this.router.refresh('cases.case.subcases-demo');
  }

  @task
  *saveCase(_case) {
    yield _case.save();
  }
}
