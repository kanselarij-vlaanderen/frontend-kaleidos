import Model, { attr, belongsTo } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class Membership extends Model {
  @attr uri;

  @belongsTo('user', { inverse: 'memberships', async: true }) user;
  @belongsTo('user-organization', { inverse: 'memberships', async: true })
  organization;
  @belongsTo('role', { inverse: 'memberships', async: true }) role;
  @belongsTo('concept', { inverse: null, async: true }) status;

  get isBlocked() {
    return this.status.get('uri') === CONSTANTS.USER_ACCESS_STATUSES.BLOCKED;
  }
}
