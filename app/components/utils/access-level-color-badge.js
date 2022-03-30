import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AccessLevelColorBadge extends Component {
  get accessPillSkin() {
    let modifier;
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          modifier = 'success';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          modifier = 'active';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          modifier = 'active';
          break;
      }
    } else {
      modifier = 'active';
    }
    return 'active';
  }
}
