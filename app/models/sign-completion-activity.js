import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignCompletionActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase', { inverse: 'signCompletionActivity', async: true })
  signSubcase;
  @belongsTo('signed-piece', { inverse: 'signCompletionActivity', async: true })
  signedPiece;

  @hasMany('sign-signing-activity', {
    inverse: 'signCompletionActivity',
    async: true,
  })
  signSigningActivities;
}
