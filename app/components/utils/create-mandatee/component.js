import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	selectedPerson: null,
	selectedDomains: [],
	today: new Date(),
	title: null,

	actions: {
		personSelected(person) {
			this.set('selectedPerson', person);
		},

		selectStartDate(val) {
			this.set('startDate', val);
		},

		selectEndDate(val) {
			this.set('endDate', val);
		},

		chooseDomain(domains) {
			this.set('selectedDomains', domains);
		},

		async createMandatee() {
			const newMandatee = this.store.createRecord('mandatee', {
				title: this.get('title'),
				start: new Date(this.get('startDate')),
				end: new Date(this.get('endDate')),
				governmentDomains: this.get('selectedDomains'),
				person: this.get('selectedPerson'),
			});
			newMandatee.save().then(() => {
				this.clearValues();
			});
		}
	},

	clearValues() {
		this.set('selectedPerson', null);
		this.set('title', null);
		this.set('startDate', null);
		this.set('endDate', null);
		this.set('selectedDomains', []);
	}
});
