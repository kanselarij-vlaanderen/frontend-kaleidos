import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
	classNames: ["vlc-input-field-block"],

	documentRows: computed('uploadedFiles.@each', function () {
		const { uploadedFiles } = this;
		if (uploadedFiles) {
			return uploadedFiles.map((uploadedFile) => {
				return Object.create({ file: uploadedFile, type: null })
			})
		} else {
			return null;
		}
	}),

	didInsertElement() {
		this._super(...arguments);
		if (!this.get('documentRows')) {
			this.set('documentRows', [Object.create({})]);
		}
	},

	actions: {
		addRow() {
			const { documentRows } = this;
			documentRows.addObject(Object.create({}));
		},

		deleteRow(documentRow) {
			const { documentRows, uploadedFiles } = this;
			const file = documentRow.file;
			this.removeFile(file);
			uploadedFiles.removeObject(file);
			documentRows.removeObject(documentRow);
		},

		chooseDocumentType(documentRow, type) {
			documentRow.file.set('documentType', type);
		},

		chooseDocumentConfidentiality(documentRow, confidentiality) {
			documentRow.file.set('confidentiality', confidentiality);
		},

		uploadedFile(uploadedFile) {
			this.get('uploadedFiles').pushObject(uploadedFile);
		},
	},

	removeFile(file) {
		$.ajax({
			method: "DELETE",
			url: '/files/' + file.id
		})
	},
});
