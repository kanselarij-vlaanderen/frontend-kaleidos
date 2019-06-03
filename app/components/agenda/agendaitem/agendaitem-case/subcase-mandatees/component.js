import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import EmberObject from '@ember/object';
import ApprovalsEditMixin from 'fe-redpencil/mixins/approvals-edit-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, ApprovalsEditMixin, {
	store: inject(),
	classNames: ["vl-u-spacer-extended-bottom-l"],
	item: null,
	propertiesToSet: ['mandatees', 'governmentDomains'],

	mandateeRows: computed('item', 'item.subcase', function () {
		return this.constructMandateeRows();
	}),

	async createMandateeRow(mandatee, iseCodes) {
		const fields = [...new Set(await Promise.all(iseCodes.map((iseCode) => iseCode.get('field'))))];
		const domains = [...new Set(await Promise.all(fields.map((field) => field.get('domain'))))];

		const domainsToShow = domains.map((domain) => domain.get('label')).join(', ');
		const fieldsToShow = fields.map((field) => field.get('label')).join(', ');

		return EmberObject.create(
			{
				fieldsToShow,
				domainsToShow,
				mandatee: mandatee,
				domains: domains,
				fields: fields,
				iseCodes: iseCodes,
			})
	},

	async getIseCodesOfMandatee(iseCodes, mandatee) {
		const iseCodesOfMandatee = await mandatee.get('iseCodes');
		return iseCodes.filter((iseCodeOfMandatee) => {
			const foundIseCode = iseCodesOfMandatee.find((iseCode) => iseCode.get('id') === iseCodeOfMandatee.get('id'));

			if (foundIseCode) {
				return true;
			} else {
				return false
			}
		})
	},

	async constructMandateeRows() {
		const { isAgendaItem } = this;
		let item;
		if (isAgendaItem) {
			item = await this.get('item.subcase');
		} else {
			item = await this.get('item');
		}

		const iseCodes = await item.get('iseCodes');
		const mandatees = await item.get('mandatees');

		return Promise.all(mandatees.map(async (mandatee) => {
			const filteredIseCodes = await this.getIseCodesOfMandatee(iseCodes, mandatee);
			return this.createMandateeRow(mandatee, filteredIseCodes);
		}))
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			this.set('mandateeRows', await this.constructMandateeRows());
			this.toggleProperty('isEditing');
		},

		addRow() {
			this.toggleProperty('isAdding');
		}
	},

	async setNewPropertiesToModel(model) {
		await this.parseDomainsAndMandatees();
		const { selectedMandatees, selectedIseCodes } = this;
		model.set('formallyOk', false);
		model.set('mandatees', selectedMandatees);
		model.set('iseCodes', selectedIseCodes);
		return model.save().then((model) => {
			return this.checkForActionChanges(model);
		});
	},

	async parseDomainsAndMandatees() {
		const mandateeRows = await this.get('mandateeRows');
		const mandatees = [];
		let selectedIseCodes = [];

		if (mandateeRows && mandateeRows.get('length') > 0) {
			mandateeRows.map(row => {
				mandatees.push(row.get('mandatee'));
				const iseCodes = row.get('iseCodes');
				iseCodes.map((code) => {
					selectedIseCodes.push(code);
				})
			})
		}
		this.set('selectedMandatees', mandatees);
		this.set('selectedIseCodes', selectedIseCodes);
	}
});
