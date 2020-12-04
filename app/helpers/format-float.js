import { helper } from '@ember/component/helper';

export function formatFloat(floatObject) {
  return floatObject[0].toFixed(2);
}

export default helper(formatFloat);
