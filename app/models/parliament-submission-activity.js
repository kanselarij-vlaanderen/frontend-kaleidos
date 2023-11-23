import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ParliamentSubmissionActivity extends Model {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('user', { async: true }) submitter;

  @hasMany('submitted-piece', { inverse: null, async: true }) submittedPieces;
}
