import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	selectedCaseType: null, 	

	actions: {
		chooseCaseType(caseType) {
			this.set('selectedCaseType',caseType);
			this.chooseCaseType(caseType);
		}
	},

	async didInsertElement() {
		this._super(...arguments);
		const caseTypes = await this.store.query('case-type', {
			sort:"label"
		});
		this.set('caseTypes', caseTypes);
		this.set('selectedCaseType', caseTypes.get('firstObject'))
	},
});
