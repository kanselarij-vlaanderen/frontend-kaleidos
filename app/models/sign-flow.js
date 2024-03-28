import Model, { attr, belongsTo } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SignFlowModel extends Model {
  @attr uri;
  @attr shortTitle;
  @attr longTitle;
  @attr('date') openingDate;
  @attr('date') closingDate;

  @belongsTo('sign-subcase', { inverse: 'signFlow', async: true }) signSubcase;
  @belongsTo('regulation-type', { inverse: 'signFlows', async: true })
  regulationType;
  @belongsTo('case', { inverse: 'signFlows', async: true }) case;
  @belongsTo('decision-activity', { inverse: 'signFlows', async: true })
  decisionActivity;
  @belongsTo('meeting', { inverse: 'signFlows', async: true })
  meeting;
  @belongsTo('user', { inverse: null, async: true }) creator;
  @belongsTo('concept', { inverse: null, async: true }) status;

  get isMarked() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.MARKED
    );
  }

  get isPrepared() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.PREPARED
    );
  }

  get isToBeApproved() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.TO_BE_APPROVED
    );
  }

  get isToBeSigned() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.TO_BE_SIGNED
    );
  }

  get isSigned() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.SIGNED
    );
  }

  get isRefused() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.REFUSED
    );
  }

  get isCanceled() {
    return (
      this.status?.get('uri') ===
      CONSTANTS.SIGNFLOW_STATUSES.CANCELED
    );
  }
}
