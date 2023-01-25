import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class UserOrganization extends Model {
  @attr('string') name;
  @attr('string') identifier;

  @belongsTo('concept', { inverse: null, async: true }) status;

  @hasMany('membership', { inverse: 'organization', async: true }) memberships;

  get isBlocked() {
    return this.status.get('uri') === CONSTANTS.USER_ACCESS_STATUSES.BLOCKED;
  }
}
