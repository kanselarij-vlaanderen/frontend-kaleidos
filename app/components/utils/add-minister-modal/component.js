import Component from '@ember/component';
import EmberObject from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	selectedMandatee: null,

	async refreshData(mandatee) {
		const iseCodes = await mandatee.get('iseCodes');
		const fields = await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')));
		const domains = await Promise.all(fields.map((field) => field.get('domain')));

		const rowToShow = EmberObject.create({
			domains: [...new Set(domains)],
			fields: [...new Set(fields)],
		});

		return rowToShow;
	},

	actions: {
		cancel() {
			this.cancel();
		},

		async mandateeSelected(mandatee) {
			const rowToShow = await this.get('rowToShow')
			if (rowToShow) {
				rowToShow.domains.map((domain) => {
					const domainToClear = this.store.peekRecord('government-domain', domain.id);
					domainToClear.set('selected', false)
				});
				rowToShow.fields.map((field) => {
					const fieldToClear = this.store.peekRecord('government-field', field.id);
					fieldToClear.set('selected', false)
				});
			}
			this.set('selectedMandatee', mandatee);

			this.set('rowToShow', await this.refreshData(mandatee));
		},

		async addMandatee() {
			const { selectedMandatee, rowToShow } = this;
			const fields = rowToShow.get('fields');
			const selectedDomains = [...new Set(rowToShow.get('domains').filter((domain) => domain.selected))];
			const selectedFields = fields.filter((field) => field.selected);
			const selectedIseCodeLists = await Promise.all(selectedFields.map((field) => field.get('iseCode')));

			this.addMandatee(selectedMandatee, selectedDomains, selectedFields, selectedIseCodeLists)

			this.cancel();
		},

		async selectDomain(domain, value) {
			const fields = await this.get('rowToShow.fields').filter((field) => field.get('domain.id') === domain.id);
			fields.map((field) => field.set('selected', value));
		},

		async selectField(domain, value) {
			const foundDomain = this.get('rowToShow.domains').find((item) => item.id == domain.id);
			const fields = await domain.get('governmentFields');
			const selectedFields = fields.filter((field) => field.selected);

			if (value) {
				foundDomain.set('selected', value);
			} else {
				if (selectedFields.length === 1) {
					foundDomain.set('selected', value);
				}
			}
		}
	}
});
