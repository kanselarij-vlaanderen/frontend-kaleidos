import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function isNota([type]) {
  return type.get('uri') === CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
}

export default helper(isNota);
