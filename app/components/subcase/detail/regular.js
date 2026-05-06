import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

export default class SubcaseDetailRegular extends Component {
  @service store;
  @service currentSession;
  @service subcaseService;
  @service draftSubmissionService;

  @tracked hideAccessLevel = false;
  @tracked latestDecisionActivity;
  @tracked isOpenBatchDetailsModal = false;
  @tracked statusChangeActivities;
  @tracked isOpenDownloadDocumentsModal = false;
  @tracked hasFilesToDownload = false;

  constructor() {
    super(...arguments);
    this.loadLatestDecisionActivity.perform();
    this.loadSubmissionData.perform();
  }

  get archivePath() {
    return `/subcases/${this.args.subcase.id}/pieces/files/archive`;
  }

  @task
  *loadLatestDecisionActivity() {
    this.latestDecisionActivity = yield this.subcaseService.getLatestDecisionActivity(this.args.subcase);
    if (this.latestDecisionActivity &&
      ((this.latestDecisionActivity.isRetracted || this.latestDecisionActivity.isPostponed) &&
      !this.currentSession.may('view-access-level-pill-when-postponed'))) {
      this.hideAccessLevel = true;
    }
    // need at least 1 file before we show the download button
    this.hasFilesToDownload = (yield this.store.count('piece', {
      'filter[submission-activities][subcase][:id:]': this.args.subcase.id,
      'filter[:has:file]': true,
    })) > 0;
  }

  loadSubmissionData = task(async () => {
    if (!isEnabledCabinetSubmissions()) {
      return;
    };
    const allSubmissions = await this.draftSubmissionService.getAllSubmissionsForSubcase(this.args.subcase);
    let statusChangeActivities= [];
    for (const submission of allSubmissions) {
      let statusChangeActivitiesOfSubmission = await this.draftSubmissionService.getStatusChangeActivities(submission);
      statusChangeActivities.push(statusChangeActivitiesOfSubmission);
    }
    this.statusChangeActivities = statusChangeActivities;
  });

  @action
  openBatchDetails() {
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.args.refresh?.();
    this.isOpenBatchDetailsModal = false;
  }

  openDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = true;
  }

  closeDownloadDocumentsModal = () => {
    this.isOpenDownloadDocumentsModal = false;
  }
}
