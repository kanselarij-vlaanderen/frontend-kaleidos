import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AccessLevelColorBadge extends Component {
  get accessPillSkin() {
    let modifier;
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          modifier = 'ongoing';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          modifier = 'ongoing';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          modifier = 'ongoing';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
          modifier = 'ongoing';
          break;
        case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD:
          modifier = 'ongoing';
          break;
      }
    } else {
      modifier = 'border';
    }
    return modifier;
  }

  get accessPillIcon() {
    let modifier;
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          modifier = 'users-four-of-four';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          modifier = 'users-three-of-four';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          modifier = 'users-two-of-four';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
          modifier = 'users-single';
          break;
        case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD:
          modifier = 'users-one-of-four';
          break;
      }
    } else {
      modifier = 'default';
    }
    return modifier;
  }
}
