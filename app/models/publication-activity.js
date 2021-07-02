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
    inverse: 'publicationActivitiesUsedBy',
  }) usedPieces;
  @hasMany('piece', {
    inverse: 'publicationActivityGeneratedBy',
  }) generatedPieces;
}
