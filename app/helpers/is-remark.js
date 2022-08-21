import { helper } from '@ember/component/helper';
import CONSTANTS from 'frontend-kaleidos/config/constants';

function isRemark([type]) {
  return type.get('uri') === CONSTANTS.AGENDA_ITEM_TYPES.REMARK;
}

export default helper(isRemark);
