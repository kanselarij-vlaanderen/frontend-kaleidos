import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	intl: inject(),
	message: null,
	title: null,
	showActions: true,
	buttonType: 'danger',

	verifyButtonText: computed('intl', function () {
		return this.intl.t('delete');
	}),

	showIcon: computed('buttonType', function () {
		if (this.buttonType === 'warning') {
			return false;
		} else {
			return true;
		}
	}),

	buttonClass: computed('buttonType', function () {
		if (this.buttonType === 'warning') {
			return ""
		} else if (this.buttonType === 'danger') {
			return "vl-button--error";
		}
	}),

	actions: {
		verify() {
			this.verify();
		},

		cancel() {
			this.cancel();
		}
	}
});
