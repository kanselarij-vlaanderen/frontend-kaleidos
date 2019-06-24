import Component from '@ember/component';

export default Component.extend({
	classNames: ['vl-modal'],
	actions: {
		closeErrorMessage() {
			this.closeErrorMessage(this.errorMessage);
		}
	}
});
