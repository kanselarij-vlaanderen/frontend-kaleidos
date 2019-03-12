import Component from '@ember/component';

export default Component.extend({
	tagName: 'li',
	classNames: ["vl-link-list__item"],
	showDetails:false,

	testFunction() {
		console.log('hey')
	},

	actions: {
		toggleShowDetails() {
			this.toggleProperty('showDetails');
		}
	}
});
