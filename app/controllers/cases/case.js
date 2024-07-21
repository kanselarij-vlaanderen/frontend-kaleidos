import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

export default class CasesCaseController extends Controller {
  @service router;

  get isAddingSubmission() {
    return isEnabledCabinetSubmissions() && this.router.currentRouteName.includes('new-submission');
  }

  get isAddingSubmissionToExistingSubcase() {
    return isEnabledCabinetSubmissions() && this.router.currentRouteName.includes('subcase.new-submission');
  }
}
