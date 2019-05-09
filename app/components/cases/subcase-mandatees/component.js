import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';


export default Component.extend({
	store: inject(),
	selectedMandatee: null,
	classNames: ["vlc-input-field-block"],
	isAdding: false,

	actions: {
		async createMandateeRow(selectedMandatee, selectedDomains, codes) {
			const mandateeRows = await this.get('mandateeRows');
			mandateeRows.addObject(EmberObject.create(
				{
					mandatee: selectedMandatee,
					selectedDomains: selectedDomains,
					iseCodes: codes
				}))
		},

		addRow() {
			this.toggleProperty('isAdding');
		},

		cancel() {
			this.set('isAdding', false);
		},

		async deleteRow(mandateeRow) {
			const mandateeRows = await this.get('mandateeRows');
			mandateeRows.removeObject(mandateeRow);
		},
	},
});
