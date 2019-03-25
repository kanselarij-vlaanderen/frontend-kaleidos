import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	isOverlay: null,

	backdropClass: computed('isOverlay', function() {
		if(this.isOverlay) return "vl-modal__backdrop";
	}),

	actions: {
		close() {
			this.closeModal();
		}
	}
});
