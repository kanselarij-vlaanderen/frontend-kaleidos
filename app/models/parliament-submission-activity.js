import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ParliamentSubmissionActivity extends Model {
  @attr('date') startDate;
  @attr('date') endDate;
  @attr('string') comment;

  @belongsTo('user', { inverse: null, async: true }) submitter;
  @belongsTo('parliament-subcase', {
    inverse: 'parliamentSubmissionActivities',
    async: true,
  })
  parliamentSubcase;

  @hasMany('submitted-piece', {
    inverse: 'parliamentSubmissionActivity',
    async: true,
  })
  submittedPieces;
}
