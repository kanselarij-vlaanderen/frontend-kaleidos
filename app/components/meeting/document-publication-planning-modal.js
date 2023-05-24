import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { ESTIMATED_PUBLICATION_DURATION } from 'frontend-kaleidos/config/config';
import subMilliseconds from 'date-fns/subMilliseconds';
import isPast from 'date-fns/isPast';

export default class MeetingDocumentPublicationPlanningModalComponent extends Component {
  @service currentSession;
  @service store;

  @tracked themisPublicationPlannedDate;
  @tracked documentPublicationPlannedDate;

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

    this.themisPublicationPlannedDate = this.args.themisPublicationActivity.plannedDate;
    this.documentPublicationPlannedDate = this.args.documentPublicationActivity.plannedDate;
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
    return (
      isBlank(this.documentPublicationPlannedDate) ||
      isBlank(this.themisPublicationPlannedDate) ||
      this.save.isRunning
    );
  }

  @action
  setDocumentPublicationDateNow() {
    this.documentPublicationPlannedDate = new Date();
  }

  @action
  setThemisPublicationDateNow() {
    this.themisPublicationPlannedDate = new Date();
  }

  @task
  *save() {
    this.args.themisPublicationActivity.plannedDate = this.themisPublicationPlannedDate;
    this.args.documentPublicationActivity.plannedDate = this.documentPublicationPlannedDate;

    // We're going to pass only activities to @onSave that require an update,
    // either because current status is 'planned' and must be updated to 'confirmed'
    // or because current status is 'confirmed' but planned date has changed
    const plannedActivities = [];
    const confirmedStatus = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.CONFIRMED);

    const [documentPublicationStatus, themisPublicationStatus] = yield Promise.all([
      this.args.documentPublicationActivity.status,
      this.args.themisPublicationActivity.status,
    ]);

    if (documentPublicationStatus.uri == CONSTANTS.RELEASE_STATUSES.PLANNED ||
        (documentPublicationStatus.uri == CONSTANTS.RELEASE_STATUSES.CONFIRMED && this.args.documentPublicationActivity.hasDirtyAttributes)) {
      this.args.documentPublicationActivity.status = confirmedStatus;
      plannedActivities.push(this.args.documentPublicationActivity);
    }

    if (themisPublicationStatus.uri == CONSTANTS.RELEASE_STATUSES.PLANNED ||
        (themisPublicationStatus.uri == CONSTANTS.RELEASE_STATUSES.CONFIRMED && this.args.themisPublicationActivity.hasDirtyAttributes)) {
      this.args.themisPublicationActivity.status = confirmedStatus;
      plannedActivities.push(this.args.themisPublicationActivity);
    }

    yield this.args.onSave(plannedActivities);
  }
}
