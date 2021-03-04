import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class DecisionResultPill extends Component {
  get modifierClass() {
    const codes = CONFIG.DECISION_RESULT_CODE_URIS;
    const selectedUri = this.args.decisionResultCode.get('uri');
    if (selectedUri === codes.GOEDGEKEURD) {
      return 'vlc-pill--success';
    } else if (selectedUri === codes.UITGESTELD) {
      return 'vlc-pill--warning';
    }
    // } else if (selectedUri === codes.INGETROKKEN) {
    //  return 'vlc-pill--error';
    // }
    return '';
  }
}
