import Component from '@ember/component';

export default Component.extend({
	classNames: ["vl-checkbox--switch__wrapper"],
	value: null,

	actions: {
		valueChanged() {
			this.toggleProperty('value');
			let action = this.get('valueChanged');
			if (action) { return action(...arguments); }
		}
	}
});
