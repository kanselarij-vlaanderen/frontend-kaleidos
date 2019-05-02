import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vlc-input-field-block"],

	defaultConfidentiality: computed('store', function() {
		return this.store.query('confidentiality', {
			filter: {label: 'Vertrouwelijk'}
		})
	}),

	documentRows: computed('uploadedFiles.@each', async function () {
		const { uploadedFiles } = this;
		const defaultConfidentiality = await this.get('defaultConfidentiality')
		if (uploadedFiles) {
			return uploadedFiles.map((uploadedFile) => {
				uploadedFile.set('confidentiality', defaultConfidentiality.get('firstObject'));
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

		async deleteRow(documentRow) {
			const { uploadedFiles } = this;
			const documentRows = await this.get('documentRows');
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
		}
	},

	removeFile(file) {
		$.ajax({
			method: "DELETE",
			url: '/files/' + file.get('id')
		})
	},
});
