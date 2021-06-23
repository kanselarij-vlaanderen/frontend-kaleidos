import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class ProofingActivity extends Model {
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
  @hasMany('piece', {
    serialize: true, // Only the hasMany side is defined in backend (override ember defaulting to belongsTo-side serializing)
  }) generatedPieces;
}
