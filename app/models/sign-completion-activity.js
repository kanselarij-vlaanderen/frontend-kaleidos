import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignCompletionActivityModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-subcase') signSubcase;
  @hasMany('sign-signing-activity') signSigningActivities;
  @belongsTo('signed-piece') signedPiece;
}
