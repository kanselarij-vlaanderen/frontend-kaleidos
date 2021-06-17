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

  @hasMany('piece') usedPieces;
  @hasMany('piece', {
    inverse: 'proofingActivityAsGenerated',
  }) generatedPieces;
}
