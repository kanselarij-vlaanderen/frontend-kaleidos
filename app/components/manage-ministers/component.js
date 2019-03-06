import Component from '@ember/component';

export default Component.extend({
	selectedMandatee:null,

	actions: {
		clearSelections() {
			this.set('selectedMandatee', null);
			this.set('selectedDomains', null);
		},

		async mandateeSelected(mandatee) {
			this.set('selectedMandatee', mandatee);
			const domains = await mandatee.get('governmentDomains');
			this.set('selectedDomains', domains);
		},

		async domainsChanged(domains) {
			this.set('selectedDomains', domains);
		},

		async saveChanges() {
			const mandatee = this.get('selectedMandatee');
			if(!mandatee) {
				return;
			} else {
				mandatee.set('governmentDomains', this.get('selectedDomains'));
				await mandatee.save();
			}
		}
	}
});
