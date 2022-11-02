import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class decisionActivity extends Model {
  @attr('date') startDate; // for publications: displayed as: Datum beslissing

  @belongsTo('agenda-item-treatment') treatment;
  @belongsTo('subcase') subcase;
  @belongsTo('concept', { inverse: null }) decisionResultCode;
  @belongsTo('piece') report;

  @hasMany('publication-flow') publicationFlows;
  @hasMany('sign-flow') signFlows;

  get isPostponed() {
    return this.decisionResultCode?.get('uri') === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD;
  }

  get isRetracted() {
    return this.decisionResultCode?.get('uri') === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN;
  }
}
