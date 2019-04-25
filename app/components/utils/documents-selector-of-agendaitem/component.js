import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	item: null,	
	itemWithDocuments: null,
	store:inject(),

	documents: computed('item.documentsVersions.@each','itemWithDocuments.documents.@each', async function() {
		const documents = await this.get('item.documents');
		const documentsAlreadyAdded = await this.get('itemWithDocuments.documents');
		return Promise.all(documents.map((document) => {
			const foundDocument = documentsAlreadyAdded.find((documentToSearch) => documentToSearch.get('id') == document.get('id'));
			if(foundDocument) {
				document.set('selected', true);
			}
			return document;
		}))
	}),

	actions: {
		async selectForPublication() {
			this.selectDocument(await this.get('documents'));
		},
	}
});
