import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  get isBlocked() {
    return this.status.get('uri') === CONSTANTS.USER_ACCESS_STATUSES.BLOCKED;
  }
}
