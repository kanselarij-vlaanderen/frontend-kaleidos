import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ['vl-modal'],
	fileService: inject(),
	actions: {
		closeErrorMessage() {
			this.closeErrorMessage(this.errorMessage);
		},
		undoChanges() {
			this.fileService.set('shouldUndoChanges', true);
			this.closeErrorMessage(this.errorMessage);
		}
	}
});
