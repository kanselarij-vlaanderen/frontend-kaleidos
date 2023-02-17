import Model, { attr, hasMany } from '@ember-data/model';

export default class RegulationType extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') abbreviation;
  @attr('string') scopeNote; // empty in data
  @attr('string') altLabel; // empty in data
  @attr('number') position;

  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-flow') signFlows;
}
