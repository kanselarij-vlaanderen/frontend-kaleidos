import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function isNota([type]) {
  let uri = type;
  if (typeof type?.get === 'function') {
    uri = type.get('uri');
  }
  return uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
}

export default helper(isNota);
