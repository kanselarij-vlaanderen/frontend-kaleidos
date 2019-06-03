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
		return field.get('domain');
	},

	getFieldOfIseCode(iseCode) {
		return iseCode.get('field');
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
				mandateeRows.addObject(EmberObject.create(
					{
						fieldsToShow, domainsToShow,
						...newRow
					}))
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
				domains: [...new Set(totalDomains)],
				fields: [...new Set(totalFields)]
			});
			this.set('rowToShow', rowToShow);
			this.set('isEditingMandateeRow', true);

		},
	},
});
