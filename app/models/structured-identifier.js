import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class StructuredIdentifier extends Model {
  // Attributes.
  @attr('number') localIdentifier;
  @attr('string') versionIdentifier;

  // Belongs To.
  @belongsTo('identification') identification;
}
