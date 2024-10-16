import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubmissionModel extends Model {
  @service currentSession;
  @service store;

  @attr uri;
  @attr shortTitle;
  @attr title;
  @attr decisionmakingFlowTitle;
  @attr('boolean') confidential;
  @attr subcaseName;
  @attr('datetime') plannedStart;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('string-set', { defaultValue: () => [] }) approvalAddresses;
  @attr approvalComment;
  @attr('string-set', { defaultValue: () => [] }) notificationAddresses;
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
  @belongsTo('meeting', { inverse: 'submissions', async: true })
  meeting;
  @belongsTo('submission-internal-review', { inverse: 'submissions', async: true })
  internalReview;

  @hasMany('mandatee', { inverse: null, async: true })
  mandatees;
  @hasMany('submission-activity', { inverse: 'submission', async: true })
  submissionActivities;
  @hasMany('submission-status-change-activity', { inverse: 'submission', async: true })
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

  get isUpdateSubmitted() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.UPDATE_INGEDIEND
    );
  }

  get isSendBackRequested() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SUBMISSION_STATUSES.AANPASSING_AANGEVRAAGD
    );
  }

  save() {
    const dirtyType = this.dirtyType;
    const currentUser = this.currentSession.user;
    if (dirtyType != 'deleted') {
      const now = new Date();
      this.modified = now;
      this.modifiedBy = currentUser;
      if (dirtyType == 'created') {
        // When saving a newly created record force the creation date to equal
        // the modified date.
        this.created = now;
      }
    }
    return super.save(...arguments);
  }
}
