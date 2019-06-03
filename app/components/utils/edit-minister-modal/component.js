import Component from '@ember/component';
import ManageMinisterMixin from 'fe-redpencil/mixins/manage-minister-mixin';

export default Component.extend(ManageMinisterMixin,
	{
		selectedMandatee: null,

		actions: {
			cancel() {
				this.cancel();
			},

			// async editMandateeRow() {
			// 	const rowToShow = await this.rowToShow;
			// 	const fields = rowToShow.get('fields');
			// 	const selectedDomains = [...new Set(rowToShow.get('domains').filter((domain) => domain.selected))];
			// 	const selectedFields = fields.filter((field) => field.selected);
			// 	const selectedIseCodeLists = await Promise.all(selectedFields.map((field) => field.get('iseCode')));

			// 	this.editMandateeRow(selectedDomains, selectedFields, selectedIseCodeLists)

			// 	this.cancel();
			// }
		}
	});
