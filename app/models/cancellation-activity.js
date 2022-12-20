import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CancellationActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('translation-subcase', {
    inverse: 'cancellationActivities',
    async: true,
  })
  subcase;
  @belongsTo('email', { inverse: 'cancellationActivity', async: true }) email;

  @hasMany('piece', { inverse: null, async: true }) usedPieces;
}
