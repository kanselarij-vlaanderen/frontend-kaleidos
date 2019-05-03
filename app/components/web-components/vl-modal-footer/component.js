import Component from '@ember/component';

export default Component.extend({
	classNames:['vlc-navbar vlc-navbar--no-padding vlc-navbar--bordered-top'],
	actions: {
		cancelAction() {
			this.cancelAction();
		},

		saveAction() {
			this.saveAction();
		}
	}
});
