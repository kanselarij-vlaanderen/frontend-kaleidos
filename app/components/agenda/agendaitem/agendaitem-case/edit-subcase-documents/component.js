import Component from '@ember/component';
import $ from 'jquery';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import { inject } from '@ember/service';

export default Component.extend(FileSaverMixin, {
	store: inject(),
	classNames: ["vl-form__group vl-u-bg-porcelain"],

	actions: {
		deleteRow(document) {
			document.set('deleted', true);
		},

		chooseDocumentType(document, type) {
			document.set('type', type);
		},

		chooseDocumentConfidentiality(document, confidentiality) {
			document.set('confidentiality', confidentiality);
		},

		async saveChanges() {
			const { documents } = this;
			await Promise.all(
				documents.map((document) => {
					if (document.get('deleted')) {
						return document.destroyRecord();
					} else {
						return document.save();
					}
				}))
			this.cancelForm();
		},

		cancelEditing() {
			this.cancelForm();
		},

		async	downloadFile(documentVersion) {
			if (!documentVersion) {
				return;
			}
			const file = await documentVersion.get('file')
			$.ajax(`/files/${file.id}/download?name=${file.filename}`, {
				method: 'GET',
				dataType: 'arraybuffer', // or 'blob'
				processData: false
			})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},
	},

	removeFile(file) {
		$.ajax({
			method: "DELETE",
			url: '/files/' + file.id
		})
	},
});
