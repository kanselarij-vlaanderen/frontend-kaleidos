import Model, { hasMany, attr } from '@ember-data/model';

export default class AccessLevel extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('string') priority;
  @attr('string') altLabel;
  @attr('string') scopeNote;

  @hasMany('piece', { inverse: null }) pieces;
}
