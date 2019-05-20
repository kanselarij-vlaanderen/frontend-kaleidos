import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer"],

	policyLevels: computed('store', function () {
		return this.store.findAll('policy-level');
	}),

	actions: {
		policyLevelChanged(event) {
			this.policyLevelChanged(event.target.value);
		}
	},

	async didInsertElement() {
		const policyLevels = await this.policyLevels;
		if (policyLevels && policyLevels.length > 0) {
			this.policyLevelChanged(policyLevels.get('firstObject'));
		}
	},
});
