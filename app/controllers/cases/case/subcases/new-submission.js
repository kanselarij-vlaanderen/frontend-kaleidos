import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class CasesCaseSubcasesNewSubmissionController extends Controller {
  @service router;
  @service preventUnload;

  submitter;
  mandatees;

  onCancelSubmission = () => {
    this.preventUnload.disable();
    this.router.transitionTo('cases.case.index');
  }

  onCreateSubmission = (submission) => {
    this.preventUnload.disable();
    this.router.transitionTo('cases.submissions.submission', submission.id);
  }
}
