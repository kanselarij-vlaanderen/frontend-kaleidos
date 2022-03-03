import Model, { hasMany, attr } from '@ember-data/model';

export default class DocumentType extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('number') priority;
  @attr('string') altLabel;

  @hasMany('document-container', { inverse: null }) documentContainers;
  @hasMany('publication-flow', { inverse: null }) publicationFlows;
}
