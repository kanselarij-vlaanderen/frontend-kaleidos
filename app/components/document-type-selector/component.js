import Component from '@ember/component';
import $ from 'jquery';
export default Component.extend({
	selectedDocumentType: null,
	documentTypes: null,

	async didInsertElement() {
		let documentTypes = await $.getJSON("/utils/document-types.json");
		this.set('documentTypes', documentTypes.documentTypes);
	},

	actions: {
		chooseDocumentType(documentType) {
			this.set('selectedDocumentType', documentType);
			this.chooseDocumentType(documentType);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('sessions', this.store.query('meeting'));
			}
		},
	},
});
