import Model, { hasMany, attr } from '@ember-data/model';

export default class SubcaseType extends Model {
  @attr label;
  @attr altLabel;
  @attr scopeNote;
  @attr uri;

  @hasMany('subcase', { inverse: null }) subcases;
}
