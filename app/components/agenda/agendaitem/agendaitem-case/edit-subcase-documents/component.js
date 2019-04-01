import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
	classNames:["vl-form__group vl-u-bg-porcelain"],

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
				if(document.get('deleted')) {
					return document.destroyRecord();
				} else {
					return document.save();
				}
			}))
			this.cancelForm();
		},

		cancelEditing() {
			this.cancelForm();
		}
	},

	removeFile(file) {
		$.ajax({
			method: "DELETE",
			url: '/files/' + file.id
		})
	},
});
