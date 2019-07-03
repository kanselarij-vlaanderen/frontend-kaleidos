import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend(UploadDocumentMixin, {
	classNames: ["vl-u-spacer"],
	isAddingDocument: false,
	store: inject(),
	modelToAddDocumentVersionTo: null,

	documentTypeToAssign: computed('modelToAddDocumentVersionTo', function () {
		const { modelToAddDocumentVersionTo } = this;
		if (modelToAddDocumentVersionTo == "signedMinutes") {
			return this.store.findRecord('document-type', CONFIG.minuteDocumentTypeId);
		} else if (modelToAddDocumentVersionTo == "signedDecision") {
			return this.store.findRecord('document-type', CONFIG.decisionDocumentTypeId);
		} else {
			return null;
		}
	}),

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		async uploadNewDocument() {
			this.set('isLoading', true);
			const item = await this.get('item');
			const documentType = await this.documentTypeToAssign;
			this.set('isCreatingDocuments', true);
			this.uploadedFiles.map((uploadedFile) => {
				uploadedFile.set('documentType', documentType);
			})
			await this.uploadFiles(item);
			await item.belongsTo('signedDocument').reload();
			await item.reload();
			this.set('isCreatingDocuments', false);
			this.set('isLoading', false);
			this.toggleProperty('isAddingNewDocument');

		}
	}
});
