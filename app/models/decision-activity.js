import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class decisionActivity extends Model {
  @attr('date') startDate; // for publications: displayed as: Datum beslissing

  @belongsTo('agenda-item-treatment', {
    inverse: 'decisionActivity',
    async: true,
  })
  treatment;
  @belongsTo('subcase', { inverse: 'decisionActivities', async: true }) subcase;
  @belongsTo('concept', { inverse: null, async: true }) decisionResultCode;
  @belongsTo('piece', { inverse: 'decisionActivity', async: true }) report;
  @belongsTo('mandatee', { inverse: 'secretaryForDecisions', async: true }) secretary;

  @hasMany('publication-flow', { inverse: 'decisionActivity', async: true })
  publicationFlows;
  @hasMany('sign-flow', { inverse: 'decisionActivity', async: true }) signFlows;

  get isPostponed() {
    return (
      this.decisionResultCode?.get('uri') ===
      CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD
    );
  }

  get isRetracted() {
    return (
      this.decisionResultCode?.get('uri') ===
      CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN
    );
  }

  get isApproved() {
    return (
      this.decisionResultCode?.get('uri') ===
      CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
    );
  }

  get isAcknowledged() {
    return (
      this.decisionResultCode?.get('uri') ===
      CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
    );
  }
}
