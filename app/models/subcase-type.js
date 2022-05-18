import Model, { hasMany, attr } from '@ember-data/model';

export default class Subcase extends Model {
  @attr label;
  @attr altLabel;
  @attr scopeNote;

  @hasMany('subcase', { inverse: null }) subcases;
}
