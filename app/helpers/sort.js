import { helper } from '@ember/component/helper';

// ember-composable-helpers seems to miss a simple sort helper
export default helper(([array] /*, hash */) => array.slice().sort() );
