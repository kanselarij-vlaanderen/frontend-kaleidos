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
			this.set('isCreatingDocuments', true);
			await this.uploadFiles(item).then(async () => {
				// item.belongsTo('document').reload();
				this.set('isCreatingDocuments', false);
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
