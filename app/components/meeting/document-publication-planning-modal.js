import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { ESTIMATED_PUBLICATION_DURATION } from 'frontend-kaleidos/config/config';
import subMilliseconds from 'date-fns/subMilliseconds';
import isPast from 'date-fns/isPast';

export default class MeetingDocumentPublicationPlanningModalComponent extends Component {

  get estimatedThemisExecutionStart() {
    return subMilliseconds(this.args.themisPublicationActivity, ESTIMATED_PUBLICATION_DURATION);
  }

  get estimatedDocumentExecutionStart() {
    return subMilliseconds(this.args.documentPublicationActivity, ESTIMATED_PUBLICATION_DURATION);
  }

  get isDisabledThemisPublication() {
    const statusPromise = this.args.themisPublicationActivity;
    const alreadyReleased = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    const lockedInReleaseWindow = statusPromise.get('uri') != CONSTANTS.RELEASE_STATUSES.CONFIRMED && isPast(this.estimatedThemisExecutionStart);
    return alreadyReleased || lockedInReleaseWindow;
  }

  get isDisabledInternalDocumentPublication() {
    const statusPromise = this.args.documentPublicationActivity;
    const alreadyReleased = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    const lockedInReleaseWindow = statusPromise.get('uri') != CONSTANTS.RELEASE_STATUSES.CONFIRMED && isPast(this.estimatedDocumentExecutionStart);
    return alreadyReleased || lockedInReleaseWindow;
  }

  get isDisabledSave() {
    return isBlank(this.args.documentPublicationActivity.plannedDate) ||
      isBlank(this.args.themisPublicationActivity.plannedDate) ||
      this.save.isRunning;
  }

  @action
  setInternalDocumentPublicationDateNow() {
    this.args.documentPublicationDate.plannedDate = new Date();
  }

  @action
  setInternalDocumentPublicationDatePicker(date) {
    this.args.documentPublicationDate.plannedDate = date;
  }

  @action
  setThemisPublicationDateNow() {
    this.args.themisPublicationActivity.plannedDate = new Date();
  }

  @action
  setThemisPublicationDatePicker(date) {
    this.args.themisPublicationActivity.plannedDate = date;
  }

  @action
  cancel() {
    this.args.documentPublicationActivity.rollbackAttributes();
    this.args.themisPublicationActivity.rollbackAttributes();
  }

  @task
  *save() {
    const plannedActivities = [];
    const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.CONFIRMED);

    if (!this.isDisabledInternalDocumentPublication) {
      this.args.documentPublicationActivity.status = status;
      plannedActivities.push(this.args.documentPublicationActivity);
    }

    if (!this.isDisabledThemisPublication) {
      this.args.themisPublicationActivity.status = status;
      plannedActivities.push(this.args.themisPublicationActivity);
    }

    if (plannedActivities.length) {
      yield this.args.onSave(plannedActivities);
    }
  }
}
