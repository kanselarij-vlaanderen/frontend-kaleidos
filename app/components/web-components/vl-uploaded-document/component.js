import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { fileDownloadPrompt } from 'fe-redpencil/utils/file-utils';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vl-uploaded-document"],
	showMetadata: true,

	didInsertElement() {
		// Make sure that the view scrolls to the center of this component
		this._super(...arguments);
		const config = { behavior: "smooth", block: "start", inline: "nearest" };
		const elements = document.getElementsByClassName("upload-container");
		elements[0].scrollIntoView(config);
	},

	actions: {
		chooseDocumentType(type) {
			this.file.set('documentType', type);
		},

		downloadFile(file) {
      fileDownloadPrompt(file);
		}
	}
});
