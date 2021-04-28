import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class Identification extends Model {
  @attr('string') idName;
  @attr('string') agency;

  @belongsTo('publication-flow') publicationFlow;
  @belongsTo('structured-identifier') structuredIdentifier;
}
