import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
	classNames: ["vl-u-spacer"],

	actions: {
		policyLevelChanged(event) {
			this.policyLevelChanged(event.target.value);
		}
	},

	async didInsertElement() {
		let policyLevels = await $.getJSON("/utils/policy-levels.json");
		this.set('policyLevels', policyLevels.policyLevels);
		if(policyLevels && policyLevels.length > 0) {
			this.policyLevelChanged(policyLevels.get('firstObject'));
		}
	},
});
