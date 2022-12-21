import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class RequestActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('translation-subcase', {
    inverse: 'requestActivities',
    async: true,
  })
  translationSubcase;
  @belongsTo('publication-subcase', {
    inverse: 'requestActivities',
    async: true,
  })
  publicationSubcase;
  @belongsTo('translation-activity', { inverse: 'requestActivity', async: true })
  translationActivity;
  @belongsTo('proofing-activity', { inverse: 'requestActivity', async: true })
  proofingActivity;
  @belongsTo('publication-activity', {
    inverse: 'requestActivity',
    async: true,
  })
  publicationActivity;
  @belongsTo('email', { inverse: 'requestActivity', async: true }) email;

  @hasMany('piece', { inverse: 'requestActivitiesUsedBy', async: true })
  usedPieces;
}
