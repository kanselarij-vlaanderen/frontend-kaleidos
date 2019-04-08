import Component from '@ember/component';

export default Component.extend({
	classNames:['vl-u-spacer--large'],
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
