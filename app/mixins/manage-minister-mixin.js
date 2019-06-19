import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Mixin.create({
	store: inject(),
	rowToShow: null,
	selectedMandatee: null,

	async refreshData(mandatee) {
		this.set('isLoading', true);
		const iseCodes = await mandatee.get('iseCodes');
		const fields = await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')));
		const domains = await Promise.all(fields.map((field) => field.get('domain')));

		const rowToShow = EmberObject.create({
			domains: [...new Set(domains)],
			fields: [...new Set(fields)],
		});
		this.set('isLoading', false);
		return rowToShow;
	},

	actions: {

		async mandateeSelected(mandatee) {
			const rowToShow = await this.get('rowToShow');
			if (rowToShow) {
				rowToShow.domains.map((domain) => {
					const domainToClear = this.store.findRecord('government-domain', domain.id);
					domainToClear.rollbackAttributes();
				});
				rowToShow.fields.map((field) => {
					const fieldToClear = this.store.findRecord('government-field', field.id);
					fieldToClear.rollbackAttributes();
				});
			}

			this.set('rowToShow', await this.refreshData(mandatee));
		},

		async selectDomain(domain, value) {
			this.set('isLoading', true);
			const fields = await this.get('rowToShow.fields').filter((field) => field.get('domain.id') === domain.id);
			fields.map((field) => field.set('selected', value));
			this.set('isLoading', false);
		},

		async selectField(domain, value) {
			this.set('isLoading', true);
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
			this.set('isLoading', false);
		},

		async saveChanges() {
			this.set('isLoading', true);

			const { selectedMandatee, rowToShow } = this;
			const fields = rowToShow.get('fields');
			const domains = rowToShow.get('domains');

			const selectedDomains = [...new Set(domains.filter((domain) => domain.selected))];
			const selectedFields = fields.filter((field) => field.selected);
			const selectedIseCodeLists = await Promise.all(selectedFields.map((field) => field.get('iseCode')));

			const newRow = EmberObject.create({
				mandatee: selectedMandatee,
				fields: selectedFields,
				domains: selectedDomains,
				iseCodes: selectedIseCodeLists
			});

			this.saveChanges(selectedMandatee, newRow);
			this.set('isLoading', false);
			this.cancel();
		},

		cancel() {
			this.cancel();
		},
	}
});
