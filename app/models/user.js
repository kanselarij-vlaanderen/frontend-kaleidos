import Model, { belongsTo, attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr emailLink;
  @attr phoneLink;

  @belongsTo('account') account;
  @belongsTo('account-group', { inverse: null }) group;
  @belongsTo('organization') organization;

  get email() {
    return this.emailLink && this.emailLink.replace(/^mailto:/, '');
  }
  get phone() {
    return this.phoneLink && this.phoneLink.replace(/^tel:/, '');
  }
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
