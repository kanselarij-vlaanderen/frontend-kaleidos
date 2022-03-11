import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CancellationActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('subcase') subcase;
  @belongsTo('email') email;
  @hasMany('piece') usedPieces;
}
