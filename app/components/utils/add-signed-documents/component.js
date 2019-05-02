import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vl-u-spacer"],
	isAddingDocument: false,
	store: inject(),
	modelToAddDocumentVersionTo: 'meetingRecord',

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		async uploadNewDocument() {
			const item = await this.get('item');
			const lastVersion = await item.get('latestDocumentVersion.versionNumber');
			const file = await this.get('uploadedFiles.lastObject')

			this.createNewDocumentVersion(file, null, lastVersion).then(() => {
				item.hasMany('documentVersions').reload();
				this.set('uploadedFiles', null);
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
