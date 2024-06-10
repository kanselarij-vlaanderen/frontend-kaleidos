import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesNewSubmissionController extends Controller {
  @service router;

  onCancelSubmission = () => {
    this.router.transitionTo('cases.case.index');
  }
}
