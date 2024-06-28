import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class AgendaFormallyOkEdit extends Component {
  get formallyOkOptions() {
    return CONFIG.formallyOkOptions;
  }
}
