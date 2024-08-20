import Service, { inject as service } from '@ember/service';
import constants from 'frontend-kaleidos/config/constants';

export default class DraftSubmissionService extends Service {
  @service store;
  @service currentSession;

  updateSubmissionStatus = async(submission, statusUri, comment='') => {
    const newStatus = await this.store.findRecordByUri('concept', statusUri);
    await this.createStatusChange(submission, statusUri, comment);
    submission.status = newStatus;
    await submission.save(); // ember will update the inverse + we do reloads
  };

  createStatusChange = async(submission, statusUri, comment='') => {
    const now = new Date();
    const currentUser = this.currentSession.user;
    const status = await this.store.findRecordByUri('concept', statusUri);

    const submissionStatusChangeActivity = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        startedBy: currentUser,
        comment,
        submission,
        status,

      }
    );
    await submissionStatusChangeActivity.save();
  };

  getStatusChangeActivities = async(submission) => {
    const statusChangeActivities = await submission.hasMany('statusChangeActivities').reload();
    await Promise.all(statusChangeActivities.map((a) => a.status));
    await Promise.all(statusChangeActivities.map((a) => a.startedBy));
    return statusChangeActivities
      .slice()
      .sort((a1, a2) => a1.startedAt.getTime() - a2.startedAt.getTime())
      .reverse();
  };

  getLatestTreatedBy = async(submission, currentlyBeingTreated=false) => {
    let statusChangeActivities = await this.getStatusChangeActivities(submission);
    if (currentlyBeingTreated) {
      // use only the latest activity
      statusChangeActivities = [statusChangeActivities.at(0)];
    }
    const treatedByActivity = statusChangeActivities?.filter((a) => a.status.get('uri') === constants.SUBMISSION_STATUSES.IN_BEHANDELING)
      .at(0);
    const user = await treatedByActivity?.startedBy;
    return user;
  };

  getCreator = async(submission) => {
    const statusChangeActivities = await this.getStatusChangeActivities(submission);
    const creationActivity = statusChangeActivities
      ?.filter(
        (a) =>
          a.status.get('uri') === constants.SUBMISSION_STATUSES.INGEDIEND ||
          a.status.get('uri') === constants.SUBMISSION_STATUSES.UPDATE_INGEDIEND
      )
      .at(0);
    // What if this is null (should never happen, mails depend on this to exist)
    const user = await creationActivity?.startedBy;
    return user;
  };
}
