import Model, { attr, hasMany } from '@ember-data/model';

export default class Role extends Model {
  @attr() uri;
  @attr() label;
  @hasMany('mandate') mandates;
  @hasMany('membership') memberships;
}
