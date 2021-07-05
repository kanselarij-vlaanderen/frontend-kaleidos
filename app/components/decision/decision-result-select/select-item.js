import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultSelectItem extends Component {
  get skin() {
    const codes = CONSTANTS.DECISION_RESULT_CODE_URIS;
    const selectedUri = this.args.decisionResultCode.get('uri');
    if (selectedUri === codes.GOEDGEKEURD) {
      return 'success';
    } else if (selectedUri === codes.UITGESTELD) {
      return 'warning';
    }
    // } else if (selectedUri === codes.INGETROKKEN) {
    //   return 'error';
    // }
    return 'default';
  }
}
