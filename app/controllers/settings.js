import Controller from '@ember/controller';

export default Controller.extend({
	isAddingNewMinister:false,
	isAddingMandate:false,
	isEditingMandatee: false,
	isManagingAlerts: false,

	actions: {
		showAddingMandateForm() {
			this.toggleProperty('isAddingMandate');
		},

		showEditingMandateeForm() {
			this.toggleProperty('isEditingMandatee');
		},

		showAlertManagementForm() {
			this.toggleProperty('isManagingAlerts');
		}
	}
});
