import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Component.extend({
	store: inject(),
	selectedMandatee: null,
	classNames: ["vlc-input-field-block"],
	isAdding: false,
	actions: {
		async createMandateeRow(selectedMandatee, domains, fields, codes) {
			const mandateeRows = await this.get('mandateeRows');

			const domainsToShow = domains.map((domain) => domain.get('label')).join(', ');
			const fieldsToShow = fields.map((field) => field.get('label')).join(', ');
			mandateeRows.addObject(EmberObject.create(
				{
					fieldsToShow,
					domainsToShow,
					mandatee: selectedMandatee,
					domains: domains,
					fields: fields,
					iseCodes: codes,
				}))
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
