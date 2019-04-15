import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from '../../../../../mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	item:null,
	propertiesToSet: ['mandatees', 'governmentDomains'],

	mandateeRows: computed('item', function () {
		return this.constructMandateeRows().then((mandateeRows) => {
			return mandateeRows;
		});
	}),

	async constructMandateeRows() {
		const {item} = this;
		const mandatees = await item.get('mandatees');
		const governmentDomains = await item.get('governmentDomains');

		let rowsToReturn = await this.createRows(mandatees);
		await this.setDomainsOfRows(governmentDomains, rowsToReturn);
		return rowsToReturn;
	},

	async createRows(mandatees) {
		return await Promise.all(mandatees.map(async (mandatee) => {
			return Object.create({
				mandatee: mandatee,
				domains: await mandatee.get('governmentDomains'),
				selectedDomains: []
			})
		}));
	},

	async setDomainsOfRows(domains, rowsToReturn) {
		return Promise.all(domains.map(async (domain) => {
			const domainMandatees = await domain.get('mandatees');
			return rowsToReturn.map(async (row) => {
				const foundMandatee = await domainMandatees.find(domainMandatee => domainMandatee.get('id') === row.mandatee.get('id'));
				if (foundMandatee) {
					row.selectedDomains.addObject(domain);
				}
			});
		}))
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			this.toggleProperty('isEditing');
		},

		mandateeRowsChanged(mandateeRows) {
			this.set('mandateeRows', mandateeRows);
		}
	},

	async setNewPropertiesToModel(model) {
		await this.parseDomainsAndMandatees();
		const { selectedMandatees, selectedDomains } = this;
		model.set('mandatees', selectedMandatees);
		model.set('governmentDomains', selectedDomains);
		return model.save();
	},

	async parseDomainsAndMandatees() {
		const mandateeRows = await this.get('mandateeRows');
		const mandatees = [];
		const selectedDomains = [];
		if (mandateeRows && mandateeRows.get('length') > 0) {
			mandateeRows.map(row => {
				mandatees.push(row.mandatee);
				const domains = row.selectedDomains;
				domains.map(domain => {
					selectedDomains.addObject(domain);
				})
			})
		}
		this.set('selectedMandatees', mandatees);
		this.set('selectedDomains', selectedDomains);
	}
});
