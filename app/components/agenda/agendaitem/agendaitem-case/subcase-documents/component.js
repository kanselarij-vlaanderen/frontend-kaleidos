import Component from '@ember/component';

export default Component.extend({
	isAddingNewDocument: false,
	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		}
	}
});
