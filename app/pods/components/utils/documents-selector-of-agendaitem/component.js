import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  item: null,
  itemWithDocuments: null,
  store: inject(),

  lastDocumentVersions: computed('item.documents.@each', 'itemWithDocuments.documentVersions.@each', async function() {
    const {
      itemWithDocuments, item,
    } = this;
    const documents = await item.get('documents');
    const documentVersionsAddedAlready = await itemWithDocuments.get('documentVersions');

    return Promise.all(documents.map(async(document) => {
      const typeLabel = await document.get('type.label');
      const lastDocumentVersion = await document.get('lastDocumentVersion');
      // Document is not updated for the version.
      // Set diplay property for the type.
      lastDocumentVersion.set('typeLabel', typeLabel);
      const foundDocument = documentVersionsAddedAlready.find((documentVersionToSearch) => documentVersionToSearch.get('id') === lastDocumentVersion.get('id'));
      if (foundDocument) {
        lastDocumentVersion.set('selected', true);
      }
      return lastDocumentVersion;
    }));
  }),

  actions: {
    async selectForPublication() {
      this.selectDocument(await this.get('lastDocumentVersions'));
    },
  },
});
