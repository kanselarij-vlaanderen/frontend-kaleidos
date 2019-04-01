import Component from '@ember/component';
import { computed } from '@ember/object';
import Object from '@ember/object';

export default Component.extend({
	isEditing: false,

	mandateeRows: computed('subcase', function () {
		return this.constructMandateeRows();
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.set('mandateeRows', this.constructMandateeRows());
			this.toggleProperty('isEditing');
		},

		mandateeRowsChanged(mandateeRows) {
			this.set('mandateeRows', mandateeRows);
		},

		async saveChanges(subcase) {
			await this.parseDomainsAndMandatees();
			const { selectedMandatees, selectedDomains } = this;
			subcase.set('mandatees', selectedMandatees);
			subcase.set('governmentDomains', selectedDomains);
			subcase.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	},

	async parseDomainsAndMandatees() {
		const mandateeRows = await this.get('mandateeRows');
		const mandatees = [];
		const selectedDomains = [];
		if (mandateeRows && mandateeRows.get('length') > 0) {
			mandateeRows.map(row => {
				mandatees.push(row.get('mandatee'));
				const domains = row.get('selectedDomains');
				domains.map(domain => {
					selectedDomains.push(domain);
				})
			})
		}
		console.log(mandatees, selectedDomains)
		this.set('selectedMandatees', mandatees);
		this.set('selectedDomains', selectedDomains);
	},

	async constructMandateeRows() {
		const subcase = await this.get('subcase');
		const mandatees = await subcase.get('mandatees');
		const domains = await subcase.get('governmentDomains');
		let i = 0;

		let rowsToReturn = await Promise.all(mandatees.map(async (mandatee) => {
			i++;
			return Object.create({
				id: i,
				mandatee: mandatee,
				domains: await mandatee.get('governmentDomains'),
				selectedDomains: []
			})
		}));

		await domains.map((domain) => {
			return rowsToReturn.map(row => {
				const index = row.domains.indexOf(domain);
				if (index != -1) {
					row.selectedDomains.push(domain);
				}
			});
			
		});
		return rowsToReturn;
	}
});
