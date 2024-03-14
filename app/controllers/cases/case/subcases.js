import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesSubcasesController extends Controller {
  @service router;

  @action
  async saveCase(_case) {
    await _case.save();
  }
}
