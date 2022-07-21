import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { ESTIMATED_PUBLICATION_DURATION } from 'frontend-kaleidos/config/config';
import subMilliseconds from 'date-fns/subMilliseconds';
import isPast from 'date-fns/isPast';

export default class MeetingDocumentPublicationPlanningModalComponent extends Component {
  @service currentSession;
  @service store;

  constructor() {
    super(...arguments);
    this.ensureFreshData.perform();
  }

  @task
  *ensureFreshData() {
    yield Promise.all([
      this.args.themisPublicationActivity.reload(),
      this.args.documentPublicationActivity.reload(),
    ]);
    yield Promise.all([
      this.args.themisPublicationActivity.belongsTo('status').reload(),
      this.args.documentPublicationActivity.belongsTo('status').reload(),
    ]);
  }

  get estimatedThemisExecutionStart() {
    return subMilliseconds(this.args.themisPublicationActivity.plannedDate, ESTIMATED_PUBLICATION_DURATION);
  }

  get estimatedDocumentExecutionStart() {
    return subMilliseconds(this.args.documentPublicationActivity.plannedDate, ESTIMATED_PUBLICATION_DURATION);
  }

  get isDisabledThemisPublication() {
    const hasPermission = this.currentSession.may('manage-themis-publications');
    const statusPromise = this.args.themisPublicationActivity.status;
    const alreadyReleased = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    const lockedInReleaseWindow = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED && isPast(this.estimatedThemisExecutionStart);
    return !hasPermission || alreadyReleased || lockedInReleaseWindow;
  }

  get isDisabledDocumentPublication() {
    const hasPermission = this.currentSession.may('manage-document-publications');
    const statusPromise = this.args.documentPublicationActivity.status;
    const alreadyReleased = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.RELEASED;
    const lockedInReleaseWindow = statusPromise.get('uri') == CONSTANTS.RELEASE_STATUSES.CONFIRMED && isPast(this.estimatedDocumentExecutionStart);
    return !hasPermission || alreadyReleased || lockedInReleaseWindow;
  }

  get isDisabledSave() {
    return isBlank(this.args.documentPublicationActivity.plannedDate) ||
      isBlank(this.args.themisPublicationActivity.plannedDate) ||
      this.save.isRunning;
  }

  @action
  setDocumentPublicationDateNow() {
    this.args.documentPublicationActivity.plannedDate = new Date();
  }

  @action
  setDocumentPublicationDatePicker(date) {
    this.args.documentPublicationActivity.plannedDate = date;
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
    this.args.onCancel();
  }

  @task
  *save() {
    const plannedActivities = [];
    const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.CONFIRMED);

    if (!this.isDisabledDocumentPublication) {
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
