import Component from '@ember/component';

export default Component.extend({
	selectedMandatee: null,

	async refreshData(mandatee) {
		const domains = await mandatee.get('governmentDomains');
		await Promise.all(domains.map(async (domain) => {
			domain.set('selected', false)
			const codes = await domain.get('codes');
			await codes.map((code) => code.set('selected', false));
		}));
	},

	actions: {
		cancel() {
			this.cancel();
		},

		async mandateeSelected(mandatee) {
			await this.refreshData(mandatee);

			this.set('selectedMandatee', mandatee);
			const domains = await mandatee.get('governmentDomains');

			this.set('selectedDomains', domains);
		},

		addMandatee() {
			const { selectedMandatee, selectedDomains } = this;
			const domainsToAdd = selectedDomains.filter((domain) => domain.selected);
			const iseCodes = domainsToAdd.map((domain) => domain.codes.filter((code) => code.selected))
			const combinedIseCodes = [];
			iseCodes.map((isecodes) => combinedIseCodes.push(...isecodes));
			this.addMandatee(selectedMandatee, domainsToAdd, combinedIseCodes);
			this.cancel();
		},

		selectDomain(domain, value) {
			const codes = domain.get('codes');
			codes.map((code) => code.set('selected', value));
		},

		async selectCode(code, domain, value) {
			const foundDomain = this.get('selectedDomains').find((item) => item.id == domain.id);
			const codes = domain.get('codes');
			const selectedCodes = codes.filter((code) => code.selected);
			if(value) {
				foundDomain.set('selected', value);
			} else {
				if(selectedCodes.length === 1) {
					foundDomain.set('selected', value);
				}
			} 
		}
	}
});
