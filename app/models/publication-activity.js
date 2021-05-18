import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class PublicationActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  // Relations.
  @belongsTo('publication-subcase') subcase;

  @hasMany('piece') usedPieces;
  // TODO this should be decision according to model, which is a type of piece but not implemented
  @hasMany('piece') generatedPieces;
}
