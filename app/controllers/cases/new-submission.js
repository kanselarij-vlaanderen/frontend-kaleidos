import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesNewSubmissionController extends Controller {
  @service router;
  @service preventUnload;

  submitter;
  mandatees;

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  onCancelSubmission = () => {
    this.preventUnload.disable();
    this.router.transitionTo('submissions.ongoing');
  }

  onCreateSubmission = (submission) => {
    this.preventUnload.disable();
    this.router.transitionTo('cases.submissions.submission', submission.id);
  }
}
