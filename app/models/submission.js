import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObject } from 'frontend-kaleidos/utils/array-helpers';

export default class SubmissionModel extends Model {
  @service currentSession;
  @service store;

  @attr uri;
  @attr shortTitle;
  @attr title;
  @attr('boolean') confidential;
  @attr('datetime') plannedStart;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('string-set', { defaultValue: () => [] }) approvedBy;
  @attr approvalComment;
  @attr('string-set', { defaultValue: () => [] }) notified;
  @attr notificationComment;

  @belongsTo('decisionmaking-flow', { inverse: 'submissions', async: true })
  decisionmakingFlow;
  @belongsTo('subcase', { inverse: 'submissions', async: true })
  subcase;
  @belongsTo('subcase-type', { inverse: null, async: true })
  type;
  @belongsTo('concept', { inverse: null, async: true })
  agendaItemType;
  @belongsTo('concept', { inverse: null, async: true })
  status;
  @belongsTo('mandatee', { inverse: null, async: true })
  requestedBy;
  @belongsTo('user', { inverse: null, async: true })
  modifiedBy;
  @belongsTo('user', { inverse: null, async: true })
  beingTreatedBy;
  @belongsTo('meeting', { inverse: 'submissions', async: true })
  meeting;

  @hasMany('mandatee', { inverse: null, async: true })
  mandatees;
  @hasMany('submission-activity', { inverse: 'submission', async: true })
  submissionActivities;
  @hasMany('submission-status-change-activity', { inverse: null, async: true })
  statusChangeActivities;
  @hasMany('concept', { inverse: null, async: true })
  governmentAreas;
  @hasMany('draft-piece', { inverse: 'submission', async: true })
  pieces;

  get isSubmitted() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.INGEDIEND
    );
  }

  get isResubmitted() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.OPNIEUW_INGEDIEND
    )
  }

  get isInTreatment() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.IN_BEHANDELING
    );
  }

  get isSentBack() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD
    );
  }

  async updateStatus(statusUri, comment) {
    const now = new Date();
    const currentUser = this.currentSession.user;
    const newStatus = await this.store.findRecordByUri('concept', statusUri);

    const submissionStatusChange = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        comment,
        submission: this,
        status: newStatus,
      }
    );
    await submissionStatusChange.save();

    this.status = newStatus;
    this.modified = now;
    this.modifiedBy = currentUser;
    const statusChangeActivities = await this.statusChangeActivities;
    addObject(statusChangeActivities, submissionStatusChange);

    await this.save();
  }
}
