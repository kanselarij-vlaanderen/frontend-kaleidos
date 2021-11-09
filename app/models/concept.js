import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
export default class Concept extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('string') altLabel;
  @hasMany('concept', { inverse: 'broader'}) narrower;
  @belongsTo('concept', { inverse: 'narrower'}) broader;
}
