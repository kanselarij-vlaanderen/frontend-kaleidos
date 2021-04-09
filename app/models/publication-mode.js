import Model, {
  attr, hasMany
} from '@ember-data/model';

export default class PublicationMode extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') priority;

  @hasMany('publication-flow') publicationFlow;
}
