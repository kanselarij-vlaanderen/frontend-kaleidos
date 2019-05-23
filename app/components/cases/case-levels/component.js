import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer"],

	policyLevels: computed('store', function () {
		return this.store.findAll('policy-level', { sort: '-label' });
	}),

	actions: {
		policyLevelChanged(event) {
			this.policyLevelChanged(event.target.value);
		}
	}

});
