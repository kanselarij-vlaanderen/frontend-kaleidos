import Component from '@ember/component';

export default Component.extend({
	tagName: 'li',
	classNames: ["vlc-minister-item"],
	showDetails: false,

	subcaseIseCodes: null,
	codesToShow: null,

	actions: {
		toggleShowDetails() {
			this.toggleProperty('showDetails');
		}
	}
});
