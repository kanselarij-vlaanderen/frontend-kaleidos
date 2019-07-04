import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ['vl-modal'],
	fileService: inject(),

	alertType: computed('errorMessage.type', function () {
		return `vl-alert-relative vl-alert-relative--center-mid vl-alert--${this.get('errorMessage.type')}`
	}),

	actions: {
		closeErrorMessage() {
			this.closeErrorMessage(this.errorMessage);
		},
		undoChanges(errorMessage) {
			const id = errorMessage.get('modelIdToDelete');
			this.fileService.set('shouldUndoChanges', true);
			this.fileService.reverseDelete(id);
			this.closeErrorMessage(this.errorMessage);
		}
	}
});
