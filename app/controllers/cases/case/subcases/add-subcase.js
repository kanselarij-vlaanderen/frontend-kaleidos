import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesAddSubcaseController extends Controller {
  @service router;

  @action
  onCreateSubcase() {
    this.router.refresh('cases.case.subcases');
  }
}
