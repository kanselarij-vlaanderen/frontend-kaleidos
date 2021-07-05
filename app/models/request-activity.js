import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class RequestActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  // Relations.
  @belongsTo('translation-subcase') translationSubcase;
  @belongsTo('publication-subcase') publicationSubcase;
  @belongsTo('translation-activity') translationActivity;
  @belongsTo('proofing-activity') proofingActivity;

  @belongsTo('email') email;

  @hasMany('piece', {
    serialize: true,
  }) usedPieces;
}
