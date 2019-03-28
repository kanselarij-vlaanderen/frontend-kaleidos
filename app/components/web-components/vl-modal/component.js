import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	isOverlay: null,
	large: false,

	backdropClass: computed('isOverlay', function() {
		const { isOverlay} = this;
		if(isOverlay) {
			return "vl-modal__backdrop";
		}
	}),

	sizeClass: computed('large', function() {
		const { large } = this;
		if(large) {
			return "vl-modal-dialog--large";
		}
	}),

	actions: {
		close() {
			this.closeModal();
		}
	}
});
