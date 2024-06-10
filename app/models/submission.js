import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SubmissionModel extends Model {
  @attr uri;
  @attr shortTitle;
  @attr title;
  @attr('boolean') confidential;
  @attr subcaseName;
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('string-set', { defaultValue: () => [] }) approvedBy;
  @attr approvalComment;
  @attr('string-set', { defaultValue: () => [] }) notified;
  @attr notificationComment;

  @belongsTo('decisionmaking-flow', { inverse: 'submissions', async: true })
  decisionmakingFlow;
  @belongsTo('subcase', { inverse: 'submission', async: true })
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
  @hasMany('draft-piece', { inverse: null, async: true })
  draftPieces;
}
