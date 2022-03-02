import Model, { hasMany, attr } from '@ember-data/model';

export default class Theme extends Model {
  @attr('string') label;
  @attr('string') scopeNote;
  @attr('boolean') deprecated;

  @hasMany('subcase', { inverse: null }) subcase;
  @hasMany('subcase', { inverse: null }) agendaitem;
}
