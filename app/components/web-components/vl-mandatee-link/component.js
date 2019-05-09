import Component from '@ember/component';

export default Component.extend({
	tagName: 'li',
	classNames: ["vlc-minister-item"],
	showDetails: false,

	actions: {
		toggleShowDetails() {
			this.toggleProperty('showDetails');
		}
	}
});
