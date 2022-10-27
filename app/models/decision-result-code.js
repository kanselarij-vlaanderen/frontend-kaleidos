import Model, { attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultCode extends Model {
  @attr('string') uri;
  @attr('string') label;
  @attr('number') priority;

  get isPostponed() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD;
  }

  get isRetracted() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN;
  }

  get isApproved() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD;
  }

  get isAcknowledged() {
    return this.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME;
  }
}
