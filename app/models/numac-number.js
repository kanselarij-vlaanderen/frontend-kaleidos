import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class NumacNumber extends Model {
  @attr('string') name;
  @belongsTo('publication-flow') publicationFlow;
}
