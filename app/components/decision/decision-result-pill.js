import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultPill extends Component {
  @service intl;

  get skin() {
    const codes = CONSTANTS.DECISION_RESULT_CODE_URIS;
    const selectedUri = this.args.decisionResultCode.get('uri');
    if (selectedUri === codes.GOEDGEKEURD) {
      return 'success';
    } else if (selectedUri === codes.UITGESTELD) {
      return 'warning';
    }
    // } else if (selectedUri === codes.INGETROKKEN) {
    //  return 'danger';
    // }
    return 'default';
  }

  get icon() {
    const codes = CONSTANTS.DECISION_RESULT_CODE_URIS;
    const selectedUri = this.args.decisionResultCode.get('uri');
    if (selectedUri) {
      if (selectedUri === codes.GOEDGEKEURD) {
        return 'check';
      } else if (selectedUri === codes.UITGESTELD) {
        return 'clock';
      }
      return 'circle-info';
    }
    return null;
  }

  get label() {
    return this.args.decisionResultCode.get('label') || this.intl.t('no-decision-set');
  }
}
