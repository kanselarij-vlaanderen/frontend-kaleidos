import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import EmberObject from '@ember/object';

import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, {
	store: inject(),
	classNames: ["vl-u-spacer--large"],
	item: null,
	propertiesToSet: ['mandatees', 'governmentDomains'],

	mandateeRows: computed('item', function () {
		return this.constructMandateeRows();
	}),

	async constructMandateeRows() {
		const {  isAgendaItem } = this;
		let item;
		if(isAgendaItem) {
			item = await this.get('item.subcase');
		} else {
			item = await this.get('item');
		}

		const iseCodes = await item.get('iseCodes');
		const mandatees = await item.get('mandatees');

		const domainsBasedOfIseCodes = await Promise.all(iseCodes.map(async (iseCode) => {
			return await iseCode.get('domain');
		}));

		return await Promise.all(mandatees.map(async (mandatee) => {
			const domains = await mandatee.get('governmentDomains');
			let row = EmberObject.create({
				mandatee: mandatee,
				selectedDomains: [],
				domains: domains,
				iseCodes: iseCodes
			});
			await domains.map((domain) => {
				const foundDomain = domainsBasedOfIseCodes.find((domainToCheck) => domainToCheck.get('id') === domain.get('id'));
				if(foundDomain) {
					row.selectedDomains.push(foundDomain);
				}
			});
			return row;
		}));
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			this.set('mandateeRows', await this.constructMandateeRows());
			this.toggleProperty('isEditing');
		},
	},

	async setNewPropertiesToModel(model) {
		await this.parseDomainsAndMandatees();
		const { selectedMandatees, selectedIseCodes, isAgendaItem } = this;
		if(isAgendaItem) {
			model = await this.get('item.subcase');
		} else {
			model = await this.get('item');
		}
		model.set('mandatees', selectedMandatees);
		model.set('iseCodes', selectedIseCodes);
		return model.save();
	},

	async parseDomainsAndMandatees() {
		const mandateeRows = await this.get('mandateeRows');
		const mandatees = [];
		const selectedIseCodes = [];
		if (mandateeRows && mandateeRows.get('length') > 0) {
			await Promise.all(mandateeRows.map(async row => {
				mandatees.push(await row.get('mandatee'));
				const iseCodes = await row.get('iseCodes');
				// console.log(iseCodes)
				// selectedIseCodes.push(...iseCodes);
			}))
		}
		this.set('selectedMandatees', mandatees);
		this.set('selectedIseCodes', [...new Set(selectedIseCodes)]);
	}
});
