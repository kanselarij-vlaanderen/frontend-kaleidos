import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class FormallyOkPill extends Component {

  selectedFormallyOkOption;

  constructor() {
    super(...arguments);
    this.loadFormallyOk();
  }

  loadFormallyOk() {
    const formallyOkOptions = CONFIG.formallyOkOptions;
    this.selectedFormallyOkOption = this.args.formallyOk ? this.args.formallyOk : formallyOkOptions.find((formallyOkOption) => formallyOkOption.uri === CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
  }
}