import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class RequestActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('translation-subcase') translationSubcase;
  @belongsTo('publication-subcase') publicationSubcase;
  @belongsTo('translation-activity') translationActivity;
  @belongsTo('proofing-activity') proofingActivity;
  @belongsTo('publication-activity') publicationActivity;
  @belongsTo('email') email;
  @hasMany('piece') usedPieces;
}
