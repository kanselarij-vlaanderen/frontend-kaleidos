import Model, { attr, belongsTo } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class ParliamentFlow extends Model {
  @attr parliamentId;
  @attr('datetime') openingDate;
  @attr('datetime') closingDate;

  @belongsTo('parliament-subcase', { inverse: 'parliamentFlow', async: true }) parliamentSubcase;
  @belongsTo('case', { inverse: 'parliamentFlow', async: true }) case;
  @belongsTo('concept', { inverse: null, async: true }) status;

  get isIncomplete() {
    return this.concept?.uri === CONSTANTS.PARLIAMENT_FLOW_STATUSES.INCOMPLETE;
  }

  get isComplete() {
    return this.concept?.uri === CONSTANTS.PARLIAMENT_FLOW_STATUSES.COMPLETE;
  }

  get isBeingHandledByFP() {
    return this.concept?.uri === CONSTANTS.PARLIAMENT_FLOW_STATUSES.BEING_HANDLED_BY_FP;
  }
}
