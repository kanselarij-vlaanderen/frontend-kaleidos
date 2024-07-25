import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CasesNewSubmissionController extends Controller {
  @service router;

  submitter;
  mandatees;

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  onCancelSubmission = () => {
    this.router.transitionTo('cases');
  }
}
