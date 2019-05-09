import Component from '@ember/component';

export default Component.extend({
	selectedMandatee: null,

	async refreshData(mandatee) {
		const fields = await mandatee.get('governmentFields');
		let domains = [];
		await Promise.all(fields.map(async (field) => {
			const domain = await field.get('domain');
			if (!(domains.find((item) => item.get('id') === domain.get('id')))) {
				domains.push(domain);
			}
		}));
		return domains;
	},

	actions: {
		cancel() {
			this.cancel();
		},

		async mandateeSelected(mandatee) {
			this.set('selectedMandatee', mandatee);
			this.set('selectedDomains', await this.refreshData(mandatee));
		},

		async addMandatee() {
			const { selectedMandatee, selectedDomains } = this;

			const domains = selectedDomains.filter((domain) => domain.selected);

			const codesSelected = await Promise.all(fieldsSelected.filter((field) => field.selected))
			const combinedIseCodes = [];

			await codesSelected.map((isecodes) => combinedIseCodes.push(...isecodes));
			// this.addMandatee(selectedMandatee, fieldsToAdd, combinedIseCodes);
			this.cancel();
		},

		selectDomain(domain, value) {
			const fields = domain.get('governmentFields');
			fields.map((field) => field.set('selected', value));
		},

		async selectField(field, domain, value) {
			const foundDomain = this.get('selectedDomains').find((item) => item.id == domain.id);
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
