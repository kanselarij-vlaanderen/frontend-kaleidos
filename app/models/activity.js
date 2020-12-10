import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class Activity extends Model {
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') finalTranslationDate;
  @attr('string') name;
  @attr('string') mailContent;

  @belongsTo('subcase') subcase;
  @belongsTo('language') language;
  @belongsTo('activity-type') type;

  @hasMany('piece') usedPieces;
  @hasMany('piece') generatedPieces;
  @hasMany('file') usedFiles;
}
