import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * Checks whether the given type is 'announcement'
 * @argument type [string|ProxyObject] URI as string or proxy object having 'uri' as attribute
 */
function isAnnouncement([type]) {
  let uri = type;
  if (typeof type?.get === 'function') {
    uri = type.get('uri');
  }
  return uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
}

export default helper(isAnnouncement);
