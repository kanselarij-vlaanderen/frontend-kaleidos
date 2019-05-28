import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vlc-document-card-item"],
	documentVersion: null,
	isShowingDocumentVersionViewer: false,

	actions: {
		async showDocumentVersionViewer(documentVersion) {
			this.set('documentVersionToShow', await documentVersion)
			this.toggleProperty('isShowingDocumentVersionViewer');
		}
	}
});
