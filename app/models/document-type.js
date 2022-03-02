import Model, { hasMany, attr } from '@ember-data/model';

export default class DocumentType extends Model {
  @attr('string') labe;
  @attr('string') scopeNote;
  @attr('number') priority;
  @attr('string') altLabel;

  @hasMany('document-container', { inverse: null }) documentContainers;
  @hasMany('publication-flow', { inverse: null }) publicationFlows;
}
