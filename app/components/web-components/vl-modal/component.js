import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	isOverlay: null,
	large: false,
	clickOutside: false,
	isDocumentViewer: null,

  keyDown: function(event) {
	  if(event.key === 'Escape') {
      this.closeModal();
    }
  },

	backdropClass: computed('isOverlay', function () {
		const { isOverlay } = this;
		if (isOverlay) {
			return "vl-modal__backdrop";
		}
	}),

	sizeClass: computed('large', 'isDocumentViewer', function () {
		const { large, isDocumentViewer } = this;
		if (large) {
			return "vl-modal-dialog--large";
		}
		if (isDocumentViewer) {
			return "vl-modal-dialog full-height";
		}
	}),

	actions: {
		close() {
			this.closeModal();
		},

		clickOutside() {
			if (this.clickOutside) {
				this.closeModal();
			}
		}
	}
});
