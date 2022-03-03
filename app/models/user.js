import Model, { belongsTo, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('email') emailLink;
  @attr('phone') phoneLink;

  @belongsTo('account') account;
  @belongsTo('account-group', { inverse: null }) group;
  @belongsTo('organization') organization;

  get email() {
    return this.emailLink;
  }
  get phone() {
    return this.phoneLink;
  }
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
