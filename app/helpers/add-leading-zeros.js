import { helper } from '@ember/component/helper';

export default helper(function addLeadingZeros([number, length]) {
  return String(number).padStart(length, '0');
});
