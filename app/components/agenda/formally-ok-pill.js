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
    const defaultOption = formallyOkOptions.find((option) => option.uri === CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
    this.selectedFormallyOkOption = this.args.formallyOk ? this.args.formallyOk : defaultOption;
  }
}