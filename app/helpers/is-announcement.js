import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function isAnnouncement([type]) {
  return type.get('uri') === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
}

export default helper(isAnnouncement);
