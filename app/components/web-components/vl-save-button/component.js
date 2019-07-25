import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
export default Component.extend({
	intl: inject(),
	tagName: 'button',
	class: "vl-button vl-button--narrow",
	type: 'button',
	attributeBindings: ['disabled:disabled'],
	classNameBindings: ['getClassNames'],

	loadingText: computed('intl', function () {
		return this.intl.t('loadingText');
	}),

	disabled: computed('isLoading', function () {
		return this.isLoading;
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

	getClassNames: computed('isLoading', 'class', function () {
		if (this.isLoading) {
			return `${this.class} vl-button--loading`;
		} else {
			return this.class;
		}
	}),

	click() {
		if (this.type === "button") {
			if (!this.isLoading) {
				this.saveAction();
			}
		}
	}
});
