import Model, { attr, hasMany } from '@ember-data/model';

export default class UserOrganization extends Model {
  @attr('string') name;
  @attr('string') identifier;

  @hasMany('membership') memberships;
}
