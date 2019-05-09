import Controller from '@ember/controller';

export default Controller.extend({
	isAddingNewMinister:false,
	isAddingMandate:false,
	isEditingMandatee: false,
	isManagingAlerts: false,
	isManagingDocumentTypes: false,
	isManagingUsers: false,
	isManagingSubcaseTypes: false,

	actions: {
		showAddingMandateForm() {
			this.toggleProperty('isAddingMandate');
		},

		showEditingMandateeForm() {
			this.toggleProperty('isEditingMandatee');
		},

		showAlertManagementForm() {
			this.toggleProperty('isManagingAlerts');
		},

		showDocumentTypesManagementForm() {
			this.toggleProperty('isManagingDocumentTypes');
		},

		showCaseTypesManagementForm() {
			this.toggleProperty('isManagingCaseTypes');
		},

		showUserManagementInterface() {
			this.toggleProperty('isManagingUsers');
		},

		showSubcaseTypesManagementForm() {
			this.toggleProperty('isManagingSubcaseTypes');
		}
	}
});
