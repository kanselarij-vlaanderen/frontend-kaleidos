import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class TranslationActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dueDate;
  @attr('datetime') targetEndDate;

  // Relations.
  @belongsTo('subcase') subcase;
  @belongsTo('language') language;

  @hasMany('piece') usedPieces;
  @hasMany('piece') generatedPieces;
}
