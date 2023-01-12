import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export default class ProofingActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('publication-subcase', {
    inverse: 'proofingActivities',
    async: true,
  })
  subcase;
  @belongsTo('request-activity', { inverse: 'proofingActivity', async: true })
  requestActivity;

  @hasMany('piece', { inverse: 'proofingActivitiesUsedBy', async: true })
  usedPieces;
  @hasMany('piece', { inverse: 'proofingActivityGeneratedBy', async: true })
  generatedPieces;

  get isFinished() {
    return !isEmpty(this.endDate);
  }
}
