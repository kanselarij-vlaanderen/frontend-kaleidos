import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  isClickable: null,
  document: null,
  myDocumentVersions: computed.alias('item.documentVersions'),

  lastDocumentVersion: computed('mySortedDocumentVersions.@each', function() {
    const sortedVersions = this.get('mySortedDocumentVersions');
    return sortedVersions.lastObject;
  }),

  lastDocumentVersionName: computed('lastDocumentVersion.name', function() {
    return this.get('lastDocumentVersion.name');
  }),

  mySortedDocumentVersions: computed('myDocumentVersions.@each', 'document.sortedDocumentVersions.@each', function() {
    return DS.PromiseArray.create({
      promise: (async() => {
        const itemVersionIds = {};
        const versions = await this.get('myDocumentVersions');
        if (versions) {
          versions.map((version) => {
            itemVersionIds[version.get('id')] = true;
          });
        }
        const documentVersions = await this.get('document.sortedDocumentVersions');
        if (documentVersions) {
          const matchingVersions = await documentVersions.filter((documentVersion) => itemVersionIds[documentVersion.id]);
          return matchingVersions;
        }
      })(),
    });
  }),

  actions: {
    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },
});
