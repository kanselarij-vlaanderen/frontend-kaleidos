import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ["vl-u-spacer"],
	store: inject(),

	actions: {
		typeChanged(event) {
			this.typeChanged(event.target.value);
		}
	},

	async didInsertElement() {
		const caseTypes = await this.store.findAll('case-type');
		this.set('caseTypes', caseTypes);
		if(caseTypes && caseTypes.length > 0) {
			this.typeChanged(caseTypes.get('firstObject').id);
		}
	}
});
