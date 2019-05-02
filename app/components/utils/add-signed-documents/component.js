import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vl-u-spacer"],
	isAddingDocument: false,
	store: inject(),

	modelToAddDocumentVersionTo: computed('item', function () {
		return this.get('item.constructor.modelName');
	}),

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		async uploadNewDocument() {
			const item = await this.get('item');
			const latestVersion = await item.get('latestDocumentVersion.versionNumber');
			const file = await this.get('uploadedFiles.lastObject');
			this.createNewDocumentVersion(file, null, latestVersion).then(() => {
				item.hasMany('signedDocumentVersions').reload();
				this.set('uploadedFiles', null);
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
