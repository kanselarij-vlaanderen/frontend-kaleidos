import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class Identification extends Model {
  @attr('string') idName;
  @attr('string') agency;

  @belongsTo('publication-flow', {
    inverse: 'identification',
  }) publicationFlow;
  @belongsTo('publication-flow', {
    inverse: 'numacNumbers',
  }) publicationFlowForNumac;
  @belongsTo('structured-identifier') structuredIdentifier;
}
