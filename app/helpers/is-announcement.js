import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function isAnnouncement([type]) {
  let uri = type;
  if (typeof type?.get === 'function') {
    uri = type.get('uri');
  }
  return uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
}

export default helper(isAnnouncement);
