import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Controller.extend(isAuthenticatedMixin, UploadDocumentMixin, {
	isAddingSubcase:false,
	isShowingOptions: false,
	
	actions: {
		toggleIsAddingSubcase() {
			this.toggleProperty('isAddingSubcase');
		},

		close() {
			this.toggleProperty('isAddingSubcase');
			this.send('refresh');
		},

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },
	}
});
