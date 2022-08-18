import { helper } from '@ember/component/helper';

export function uppercase([string]) {
  return string.toUpperCase();
}

export default helper(uppercase);
