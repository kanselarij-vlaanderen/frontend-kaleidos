import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class CasesCaseController extends Controller {
  @service router;

  get isAddingSubmission() {
    return this.router.currentRouteName.includes('new-submission');
  }

  get isAddingSubmissionToExistingSubcase() {
    return this.router.currentRouteName.includes('subcase.new-submission');
  }
}
