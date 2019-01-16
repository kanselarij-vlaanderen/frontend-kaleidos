import { helper } from '@ember/component/helper';

export function sum(extended) {
  if (extended.includes(false)) {
    return "Uitstellen";
  } else {
    return "On-uitstellen";
  }
}

export default helper(sum);