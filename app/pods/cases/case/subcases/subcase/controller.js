import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CasesCaseSubcasesSubcaseController extends Controller {
  @action
  refreshSubcases() {
    this.send('refreshParentModel');
  }
}
