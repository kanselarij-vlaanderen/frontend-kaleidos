import Component from '@ember/component';

export default Component.extend({
	classNames: ['vlc-navbar vlc-navbar--no-padding'],
	classBindings: ['getClassNames'],
	loadingText: "Even geduld",
	isLoading: null,

	getClassNames() {
		if (!this.get('nonBordered')) {
			return 'vlc-navbar--bordered-top'
		}
	},

	actions: {
		cancelAction() {
			this.cancelAction();
		},

		saveAction() {
			this.saveAction();
		}
	}
});
