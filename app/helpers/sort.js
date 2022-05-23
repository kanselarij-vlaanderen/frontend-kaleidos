import { helper } from '@ember/component/helper';

// ember-composable-helpers seems to miss a simple sort helper
export default helper(([array] /*, hash */) => array?.slice().sort((a, b) => a - b /* custom sort fn: handle dates correctly (not on toString() value) */));
