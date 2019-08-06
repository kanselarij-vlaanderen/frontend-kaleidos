import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
export default Component.extend({
	intl: inject(),
	tagName: 'button',
	classNames: ['vl-button', 'vl-button--narrow'],
	type: 'button',
	attributeBindings: ['isLoading:disabled'],
	classNameBindings: ['isLoading:vl-button--loading'],

	loadingText: computed('intl', function () {
		return this.intl.t('loadingText');
	}),

	focus: computed('isLoading', function () {
		return !this.isLoading;
	}),

	textToDisplay: computed('text', 'isLoading', 'loadingText', function () {
		if (this.isLoading) {
			return this.loadingText;
		}
		return this.text;
	}),

	click() {
		if (this.type === "button") {
			if (!this.isLoading) {
				this.saveAction();
			}
		}
	}
});
