import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument pieces:
 * @argument highlightedPieces:
 */
export default class DcoumentsDocumentBadgeListComponent extends Component {
  shouldShowAccessLevel(accessLevel) {
    return (accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.MINISTERRAAD) || (accessLevel?.uri === CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE);
  }
}
