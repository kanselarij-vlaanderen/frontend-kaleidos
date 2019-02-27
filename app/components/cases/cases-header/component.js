import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-page-header"],
	isAddingCase: false,
	actions: {
		toggleAddingCase() {
			this.toggleProperty('isAddingCase');
		}
	}
});
