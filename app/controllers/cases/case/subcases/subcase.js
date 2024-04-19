import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcaseController extends Controller {
  @service router;

  @action
  refreshSubcases() {
    this.router.refresh('cases.case');
  }
}
