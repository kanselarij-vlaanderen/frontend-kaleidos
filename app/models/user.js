import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') identifier;

  @belongsTo('account', { inverse: 'user', async: true }) account;
  @belongsTo('concept', { inverse: null, async: true }) status;
  @belongsTo('login-activity', { inverse: 'user', async: true }) loginActivity;
  @belongsTo('person', { inverse: 'user', async: true }) person;

  @hasMany('membership', { inverse: 'user', async: true }) memberships;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isBlocked() {
    return this.status.get('uri') === CONSTANTS.USER_ACCESS_STATUSES.BLOCKED;
  }
}
