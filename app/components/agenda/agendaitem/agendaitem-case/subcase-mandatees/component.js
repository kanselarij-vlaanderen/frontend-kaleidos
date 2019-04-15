import Component from '@ember/component';
import { computed } from '@ember/object';
import Object from '@ember/object';

export default Component.extend({
	isEditing: false,

	mandatees: computed('agendaitem.mandatees', 'subcase.mandatees', function () {
		const { agendaitem, subcase } = this;
		if (agendaitem) {
			return agendaitem.get('sortedMandatees');
		} else {
			return subcase.get('sortedMandatees');
		}
	}),

	governmentDomains: computed('agendaitem.governmentDomains', 'subcase.governmentDomains', function () {
		const { agendaitem, subcase } = this;
		if (agendaitem) {
			return agendaitem.get('governmentDomainsToShow');
		} else {
			return subcase.get('governmentDomains');
		}
	}),

	mandateeRows: computed('agendaitem.mandatees', 'subcase.mandatees', function () {
		return this.constructMandateeRows();
	}),

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
					row.selectedDomains.push(domain);
				}
			});
		}))
	},

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

		async saveChanges() {
			await this.parseDomainsAndMandatees();
			const { agendaitem, subcase } = this;

			if (agendaitem) {
				const isDesignAgenda = await agendaitem.get('isDesignAgenda');
				if (isDesignAgenda) {
					const subcaseToEdit = await agendaitem.get('subcase');
					await this.setNewPropertiesToModel(subcaseToEdit);
					this.setNewPropertiesToModel(agendaitem).then(() => {
						this.toggleProperty('isEditing');
					});
				}
			} else {
				await this.setNewPropertiesToModel(subcase);
				const agendaitemsOnDesignAgendaToEdit = await subcase.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						this.setNewPropertiesToModel(agendaitem);
					})
				}
				this.toggleProperty('isEditing');
			}
		}
	},

	async setNewPropertiesToModel(model) {
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

	async constructMandateeRows() {
		const { mandatees, governmentDomains } = this

		let rowsToReturn = await this.createRows(mandatees);
		await this.setDomainsOfRows(governmentDomains, rowsToReturn);
		return rowsToReturn;
	}
});
