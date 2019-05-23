import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vl-uploaded-document"],

	sizeToShow: computed('file', function () {
		return this.bytesToSize(this.get('file.size'));
	}),

	filteredItems: computed('subcase', async function () {
		return this.store.query('document-type',
			{
				filter: await this.get('subcase.documentTypeFilter'),
				sort: "label",
				page: { size: 50 }
			});
	}),

	fileName: computed('file', function () {
		return this.get('file.name');
	}),

	bytesToSize(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	},

	actions: {
		chooseDocumentType(type) {
			this.file.set('documentType', type);
		},
		chooseDocumentConfidentiality(confidentiality) {
			this.file.set('confidentiality', confidentiality);
		},

		async downloadFile(file) {
			$.ajax(`/files/${file.id}/download?name=${file.name}`, {
				method: 'GET',
				dataType: 'arraybuffer', // or 'blob'
				processData: false
			})
				.then((content) => this.saveFileAs(file.name, content, file.get('contentType')));
		}
	}
});
