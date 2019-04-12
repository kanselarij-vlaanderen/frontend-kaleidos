import Component from '@ember/component';

export default Component.extend({
	classNames:["vlc-page-header", "vl-u-bg-alt"],
	isAddingCase: false,
	actions: {
		toggleAddingCase() {
			this.toggleProperty('isAddingCase');
		}
	}
});
