import Model, { attr, belongsTo } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class Membership extends Model {
  @attr uri;

  @belongsTo('user') user;
  @belongsTo('user-organization') organization;
  @belongsTo('role') role;
  @belongsTo('concept') status;

  get isBlocked() {
    return this.status.get('uri') === CONSTANTS.USER_ACCESS_STATUSES.BLOCKED;
  }
}
