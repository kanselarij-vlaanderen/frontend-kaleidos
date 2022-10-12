import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') identifier;

  @belongsTo('account') account;
  @belongsTo('concept') status;

  @hasMany('membership') memberships;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
