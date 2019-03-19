import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	selectedDocumentType: null,
	documentTypes: null,

	async didInsertElement() {
		const documentTypes = this.store.findAll('document-type', {sort:'label'});
		this.set('documentTypes', documentTypes);
	},

	actions: {
		chooseDocumentType(documentType) {
			this.set('selectedDocumentType', documentType);
			this.chooseDocumentType(documentType);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				const documentTypes = this.store.findAll('document-type', {sort:'label'});
				this.set('documentTypes', documentTypes);
			}
		}
	},
});
