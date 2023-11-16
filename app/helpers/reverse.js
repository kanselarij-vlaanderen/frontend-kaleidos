import { helper } from '@ember/component/helper';

export function reverse([arr]) {
  return arr.slice().reverse();
}

export default helper(reverse);