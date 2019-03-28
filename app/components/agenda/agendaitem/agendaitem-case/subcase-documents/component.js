import Component from '@ember/component';

export default Component.extend({
	isAddingNewDocument: false,
	isEditing:false,

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
		}
	}
});
