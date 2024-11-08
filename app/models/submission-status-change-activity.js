import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmissionStatusChangeActivityModel extends Model {
  @attr uri;
  @attr('datetime') startedAt;
  @attr comment;

  @belongsTo('submission', { inverse: 'statusChangeActivities', async: true }) submission;
  @belongsTo('concept', { inverse: null, async: true }) status;
  @belongsTo('user', { inverse: null, async: true }) startedBy;
}
