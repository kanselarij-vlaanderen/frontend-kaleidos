import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';

export default Component.extend(UploadDocumentMixin, {
	classNames:["vl-u-spacer"],
	isAddingDocument: false,
	store: inject(),
	modelToAddDocumentVersionTo: 'meetingRecord',

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		async uploadNewDocument() {
			const item = await this.get('item');
			const document = await item.get('documentVersions')
			if(!document) {
				this.uploadFiles(item).then(() => {
					item.hasMany('documentVersions').reload();
					this.toggleProperty('isAddingNewDocument');
				});
			}
		}
	}
});
