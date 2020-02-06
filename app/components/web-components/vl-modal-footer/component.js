import Component from '@ember/component';

export default Component.extend({
	classNames: ['vlc-navbar vlc-navbar--no-padding'],
	classBindings: ['getClassNames'], // TODO: This behaviour currently doesn't show, as it is "classNameBindings" ... Do we still want this? If so: correct, if not: remove.
	isLoading: null,
  disableSave: false,

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
