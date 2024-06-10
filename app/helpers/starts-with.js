import { helper } from '@ember/component/helper';

export function startsWith([str, prefix]) {
  return typeof str === 'string' && str.startsWith(prefix);
}

export default helper(startsWith);