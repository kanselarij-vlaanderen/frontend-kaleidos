import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class StructuredIdentifier extends Model {
  @attr('number') localIdentifier;
  @attr('string') versionIdentifier;

  @belongsTo('identification') identification;
}
