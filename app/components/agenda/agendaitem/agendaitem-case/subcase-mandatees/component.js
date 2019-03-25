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

		saveChanges(subcase) {
			this.parseDomainsAndMandatees();
			const { selectedMandatees, selectedDomains } = this;
			subcase.set('mandatees', selectedMandatees);
			subcase.set('governmentDomains', selectedDomains);
			subcase.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	},

	parseDomainsAndMandatees() {
		const mandateeRows = this.get('mandateeRows');
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
		this.set('selectedMandatees', mandatees);
		this.set('selectedDomains', selectedDomains);
	},

	constructMandateeRows() {
		const subcase = this.get('subcase');
		const mandatees = subcase.get('mandatees');
		const domains = subcase.get('governmentDomains');
		let i = 0;

		let rowsToReturn = mandatees.map((mandatee) => {
			i++;
			return Object.create({
				id: i,
				mandatee: mandatee,
				domains: mandatee.get('governmentDomains'),
				selectedDomains: []
			})
		})

		domains.map((domain) => {
			rowsToReturn.forEach(row => {
				const index = row.domains.indexOf(domain);
				if (index != -1) {
					row.selectedDomains.push(domain);
				}
			});
			return domain;
		});
		return rowsToReturn;
	}
});
