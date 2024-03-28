import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';

export default class SubmissionsAlertComponent extends Component {
  @service intl;

  @tracked showActivity = null;

  get message() {
    if (this.args.parliamentFlow.isIncomplete) {
      return this.intl.t('this-case-was-submitted-to-VP-on');
    } else if (this.args.parliamentFlow.isBeingHandledByFP) {
      return this.intl.t('this-case-was-submitted-on');
    } else if (this.args.parliamentFlow.isComplete) {
      return this.intl.t('this-case-was-submitted-to-VP-on');
    } else {
      return this.intl.t('this-case-was-submitted-to-VP-on');
    }
  }

  get parliamentLinkMessage() {
    if (this.args.parliamentFlow.isBeingHandledByFP) {
      return this.intl.t('this-case-is-being-handled-by-VP');
    }
    return '';
  }

  get parliamentLink() {
    return CONSTANTS.PARLIAMENT_CASE_URL_BASE + this.args.parliamentFlow.parliamentId;
  }

  get skin() {
    if (this.args.parliamentFlow.isBeingHandledByFP) {
      return "success";
    } else {
      return "info";
    }
  }

  formatDate (date, isLast, at = "om") {
    let formattedDate = dateFormat(date, `dd-MM-yyyy '${at}' HH:mm`);
    if (isLast) {
      formattedDate += '.';
    }
    return formattedDate;
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
