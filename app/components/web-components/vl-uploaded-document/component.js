import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import $ from 'jquery';

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

		downloadFile(file, filename) {
      filename = filename || file.get('filename');
			return $.ajax(`/files/${file.id}/download`, {
				method: 'GET',
				dataType: 'blob',
				processData: false
			})
				.then((content) => this.saveFileAs(filename, content, file.get('contentType')));
		}
	}
});
