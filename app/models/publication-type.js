import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class PublicationType extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') scopeNote; // empty in data
  @attr('string') altLabel; // empty in data
  @attr('number') priority;

  @hasMany('publication-flow') publicationFlow;
}
