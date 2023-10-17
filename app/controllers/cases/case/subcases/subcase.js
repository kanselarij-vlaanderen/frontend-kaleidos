import Controller from '@ember/controller';
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

  @tracked isOpenSideNav = true;

  @action
  openSideNav() {
    this.isOpenSideNav = true;
  }

  @action
  collapseSideNav() {
    this.isOpenSideNav = false;
  }
}
