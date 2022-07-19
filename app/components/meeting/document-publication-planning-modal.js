import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class MeetingDocumentPublicationPlanningModalComponent extends Component {

  get isDisabledThemisPublication() {
    const alreadyReleased = this.args.themisPublicationActivity.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    // TODO add check if status confirmed that it doesn't fall within the release window
    return alreadyReleased;
  }

  get isDisabledInternalDocumentPublication() {
    const alreadyReleased = this.args.documentPublicationActivity.status.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    // TODO add check if status is confirmed that it doesn't fall within the release window
    return alreadyReleased;
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
