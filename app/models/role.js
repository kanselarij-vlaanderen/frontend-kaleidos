import Model, { attr, hasMany } from '@ember-data/model';

export default class Role extends Model {
  @attr uri;
  @attr label;
  @attr('number') position;

  @hasMany('mandate', { inverse: 'role', async: true }) mandates;
  @hasMany('membership', { inverse: 'role', async: true }) memberships;
}
