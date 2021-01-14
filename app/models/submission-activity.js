import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class SubmissionActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('subcase') subcase;
  @hasMany('piece') pieces;
  @hasMany('mandatee') submitters;
}
