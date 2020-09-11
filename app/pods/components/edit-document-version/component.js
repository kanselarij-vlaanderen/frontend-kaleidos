import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  tagName: 'tr',
  myDocuments: computed.alias('agendaitemOrSubcaseOrMeeting.documentVersions'),

  myLastDocument: computed('mySortedDocuments.@each', function() {
    const mySortedDocuments = this.get('mySortedDocuments');
    return mySortedDocuments.lastObject;
  }),

  myLastDocumentName: computed('myLastDocument.name', function() {
    return this.get('myLastDocument.name');
  }),

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-document-version/component.js
  // TODO: THIS CODE HAS BEEN REFACTORED TO USE BETTER VARIABLE NAMES
  mySortedDocuments: computed('myDocuments.@each', 'documentContainer.sortedDocuments.@each', function() {
    return DS.PromiseArray.create({
      promise: (async() => {
        const documentIds = {};
        const myDocuments = await this.get('myDocuments');
        if (myDocuments) {
          myDocuments.map((document) => {
            documentIds[document.get('id')] = true;
          });
        }
        const documentsFromContainer = await this.get('documentContainer.sortedDocuments');
        if (documentsFromContainer) {
          const matchingDocuments = await documentsFromContainer.filter((document) => documentIds[document.id]);
          return matchingDocuments;
        }
      })(),
    });
  }),

  actions: {

    deleteRow(documentContainer) {
      documentContainer.set('deleted', true);
    },
    chooseDocumentType(documentContainer, type) {
      documentContainer.set('type', type);
    },

    async chooseAccessLevel(document, accessLevel) {
      document.set('accessLevel', accessLevel);
    },
  },
});
