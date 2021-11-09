import Model, { attr, hasMany } from '@ember-data/model';
export default class Concept extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
  @hasMany('concept') narrower;
}
