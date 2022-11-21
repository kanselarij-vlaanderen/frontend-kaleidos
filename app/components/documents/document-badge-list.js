import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument pieces:
 * @argument highlightedPieces:
 */
export default class DcoumentsDocumentBadgeListComponent extends Component {
  shouldShowAccessLevel(accessLevel) {
    return [
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
      CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE
    ].includes(accessLevel?.uri);
  }
}
