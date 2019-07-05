import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import ManageMinisterMixin from 'fe-redpencil/mixins/manage-minister-mixin';

export default Component.extend(ManageMinisterMixin, {
	store: inject(),
	classNames: ["vlc-input-field-block"],
	isAdding: false,
	isEditingMandateeRow: false,

	getDomainOfField(field) {
		if (field)
			return field.get('domain');
	},

	getFieldOfIseCode(iseCode) {
		if (iseCode)
			return iseCode.get('field');
	},

	checkMandateeRowsForSubmitter(mandateeRows) {
		const submitters = mandateeRows.filter((item) => item.get('isSubmitter'));
		return submitters.get('length') > 0;
	},

	actions: {
		async saveChanges(mandatee, newRow) {
			const rowToShow = await this.get('rowToShow');
			const mandateeRows = await this.get('mandateeRows');
			const domainsToShow = newRow.domains.map((domain) => domain.get('label')).join(', ');
			const fieldsToShow = newRow.fields.map((field) => field.get('label')).join(', ');
			if (rowToShow) {
				let rowToEdit = mandateeRows.find((row) => row.mandatee.id === mandatee.id);
				rowToEdit.set('domains', newRow.domains);
				rowToEdit.set('fields', newRow.fields);
				rowToEdit.set('iseCodes', newRow.iseCodes);
				rowToEdit.set('fieldsToShow', fieldsToShow);
				rowToEdit.set('domainsToShow', domainsToShow);
				this.set('isEditingMandateeRow', false);
				this.set('rowToShow', null);
			} else {
				if (this.checkMandateeRowsForSubmitter(mandateeRows)) {
					newRow.set('isSubmitter', false);
				}
				mandateeRows.addObject(EmberObject.create(
					{
						fieldsToShow, domainsToShow,
						...newRow
					}));
				this.set('mandateeRows', mandateeRows.sortBy('mandateePriority'));
			}
		},

		cancel() {
			this.set('isAdding', false);
			this.set('isEditingMandateeRow', false);
		},

		async deleteRow(mandateeRow) {
			const mandateeRows = await this.get('mandateeRows');
			mandateeRows.removeObject(mandateeRow);
		},

		async editRow(mandateeRow) {
			this.set('selectedMandateeRow', await mandateeRow);
			const mandatee = mandateeRow.mandatee;
			this.set('isLoading', true);
			const totalIseCodes = await mandatee.get('iseCodes');
			const totalFields = [];
			const totalDomains = [];

			await Promise.all(totalIseCodes.map(async (iseCode) => {
				const field = await this.getFieldOfIseCode(iseCode);
				const domain = await this.getDomainOfField(field);
				const findSelectedIseCode = mandateeRow.iseCodes.find((codeToCheck) => codeToCheck.get('id') === iseCode.get('id'))
				if (findSelectedIseCode) {
					field.set('selected', true);
					domain.set('selected', true);
				}
				totalDomains.push(domain);
				totalFields.push(field);
				return iseCode;
			}))

			const rowToShow = EmberObject.create({
				mandatee: mandatee,
				domains: [...new Set(totalDomains.filter((item) => item))],
				fields: [...new Set(totalFields.filter((item) => item))]
			});
			this.set('isLoading', false);
			this.set('rowToShow', rowToShow);
			this.set('isEditingMandateeRow', true);
		},

		async valueChanged(mandateeRow) {
			const mandateeRows = await this.mandateeRows;
			const newRows = mandateeRows.map((item) => {
				if (item === mandateeRow) {
					item.set('isSubmitter', true);
				} else {
					item.set('isSubmitter', false);
				}
				return item;
			});
			this.set('mandateeRows', newRows);
		}
	},
});
