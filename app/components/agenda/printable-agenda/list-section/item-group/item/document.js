import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaPrintableAgendaListSectionItemGroupItemDocumentListDocumentComponent extends Component {

  get showAccessLevel() {
    const accessLevelUri = this.args.accessLevel.get('uri');
    return (accessLevelUri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) || (accessLevelUri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
  }
}
