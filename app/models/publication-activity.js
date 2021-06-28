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
  @belongsTo('request-activity') requestActivity;

  @hasMany('piece', {
    serialize: true, // Only the hasMany side is defined in backend (override ember defaulting to belongsTo-side serializing)
  }) usedPieces;
  // TODO this should be decision according to model, which is a type of piece but not implemented
  @hasMany('piece', {
    serialize: true, // Only the hasMany side is defined in backend (override ember defaulting to belongsTo-side serializing)
  }) generatedPieces;
}
