import Component from '@glimmer/component'; 
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SubmissionsAlertComponent extends Component {
  @service intl;

  @tracked showActivity = null;

  get message() {
    if (this.args.parliamentFlow.isIncomplete) {
      return this.intl.t('this-case-was-incompletely-submitted-to-VP-on');
    } else {
      return this.intl.t('this-case-was-completely-submitted-to-VP-on');
    }
  }

  get skin() {
    if (this.args.parliamentFlow.isIncomplete) {
      return "warning";
    } else {
      return "success";
    }
  }

  @action
  showModalFor(submissionActivity) {
    this.showActivity = submissionActivity;
  }

  @action
  closeModal() {
    this.showActivity = null;
  }
}
