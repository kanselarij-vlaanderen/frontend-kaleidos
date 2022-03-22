import { helper } from '@ember/component/helper';
import { getIconName } from '../utils/icon-name';

export function iconName([extension]) {
  return getIconName(extension);
}

export default helper(iconName);
