import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { computed } from '@ember/object';
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

	sizeToShow: computed('file', function () {
		return this.bytesToSize(this.get('file.size'));
	}),

	filter: computed('subcase', async function () {
		const filter = await this.get('subcase.documentTypeFilter');
		if (filter) {
			return filter;
		} else {
			return {};
		}
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
