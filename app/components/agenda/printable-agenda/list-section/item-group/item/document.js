import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintableAgendaListSectionItemGroupItemDocumentListDocumentComponent extends Component {

  get showAccessLevel() {
    return (this.args.accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) || (this.args.accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
  }
}
