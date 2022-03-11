import Model, { belongsTo, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('email') email;
  @attr('phone') phone;

  @belongsTo('account') account;
  @belongsTo('account-group', { inverse: null }) group;
  @belongsTo('organization') organization;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
