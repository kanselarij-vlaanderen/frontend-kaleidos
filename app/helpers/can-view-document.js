import { helper } from '@ember/component/helper';
import { canViewDocument } from '../utils/can-view-document';

export function iconName([file]) {
  return canViewDocument(file);
}

export default helper(iconName);
