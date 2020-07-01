import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  tagName: 'tr',
  myDocumentVersions: computed.alias('item.documentVersions'),

  lastDocumentVersion: computed('mySortedDocumentVersions.@each', function () {
    const sortedVersions = this.get('mySortedDocumentVersions');
    return sortedVersions.lastObject;
  }),

  lastDocumentVersionName: computed('lastDocumentVersion.name', function () {
    return this.get('lastDocumentVersion.name');
  }),

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-document-version/component.js
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

    deleteRow(document) {
      document.set('deleted', true);
    },
    chooseDocumentType(document, type) {
      document.set('type', type);
    },

    async chooseAccessLevel(document, accessLevel) {
      let documentVersion = await document.get('lastDocumentVersion');
      documentVersion.set('accessLevel', accessLevel);
    },

    async toggleConfidential(document) {
      const value = document.get('lastDocumentVersion.confidential');
      document.set('lastDocumentVersion.confidential', !value);
    }
  }
});
