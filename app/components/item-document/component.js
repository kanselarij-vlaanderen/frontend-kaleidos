import Component from '@ember/component';
import { deprecatingAlias } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  isClickable: null,
  myDocumentVersions: computed.alias('item.documentVersions'),

  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  lastDocumentVersion: computed('mySortedDocumentVersions.@each', function () {
    const sortedVersions = this.get('mySortedDocumentVersions');
    return sortedVersions.lastObject;
  }),

  lastDocumentVersionName: computed('lastDocumentVersion.name', function () {
    return this.get('lastDocumentVersion.name');
  }),

  mySortedDocumentVersions: computed('myDocumentVersions.@each', 'document.sortedDocumentVersions.@each', function () {
    return DS.PromiseArray.create({
      promise: (async () => {
        const itemVersionIds = {};
        const versions = await this.get('myDocumentVersions');
        if (versions) {
          versions.map((item) => {
            itemVersionIds[item.get('id')] = true;
          });
        }
        const documentVersions = await this.get('document.sortedDocumentVersions');
        if (documentVersions) {
          const matchingVersions = await documentVersions.filter((item) => {
            return itemVersionIds[item.id];
          });
          return matchingVersions;
        }

        return;
      })()
    });
  }),

  actions: {
    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },
});
