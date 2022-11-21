import { helper } from '@ember/component/helper';

/* custom sort fn: handle dates correctly (not on toString() value) */
function sort(array) {
  return array?.slice().sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));
}

// ember-composable-helpers seems to miss a simple sort helper
export default helper(([array] /*, hash */) => sort(array));
