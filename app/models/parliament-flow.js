import Model, { attr, belongsTo } from '@ember-data/model';
import { get } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class ParliamentFlow extends Model {
  @attr parliamentId;
  @attr('datetime') openingDate;
  @attr('datetime') closingDate;

  @belongsTo('parliament-subcase', { inverse: 'parliamentFlow', async: true }) parliamentSubcase;
  @belongsTo('case', { inverse: 'parliamentFlow', async: true }) case;
  @belongsTo('concept', { inverse: null, async: true }) status;

  get isIncomplete() {
    // eslint-disable-next-line ember/no-get
    return get(this, 'status.uri') === CONSTANTS.PARLIAMENT_FLOW_STATUSES.INCOMPLETE;
  }

  get isComplete() {
    // eslint-disable-next-line ember/no-get
    return get(this, 'status.uri') === CONSTANTS.PARLIAMENT_FLOW_STATUSES.COMPLETE;
  }

  get isBeingHandledByFP() {
    // eslint-disable-next-line ember/no-get
    return get(this, 'status.uri') === CONSTANTS.PARLIAMENT_FLOW_STATUSES.BEING_HANDLED_BY_FP;
  }
}
