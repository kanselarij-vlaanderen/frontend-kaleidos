import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class UserOrganization extends Model {
  @attr('string') name;
  @attr('string') identifier;

  @belongsTo('concept') status;

  @hasMany('membership') memberships;
}
