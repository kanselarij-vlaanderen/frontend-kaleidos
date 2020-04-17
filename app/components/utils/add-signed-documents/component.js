import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { inject } from '@ember/service';
import { computed, set } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { tracked } from '@glimmer/tracking';

export default Component.extend(UploadDocumentMixin, isAuthenticatedMixin, {
  store: inject(),
  classNames: ['vl-u-spacer'],
  @tracked isAddingDocument: null,
  @tracked isAddingNewDocument: null,
  isLoading: null,

  documentTypeToAssign: computed('modelToAddDocumentVersionTo', function () {
    const { modelToAddDocumentVersionTo } = this;
    if (modelToAddDocumentVersionTo == 'signedMinutes') {
      return this.store.findRecord('document-type', CONFIG.minuteDocumentTypeId);
    } else if (modelToAddDocumentVersionTo == 'signedDecision') {
      return this.store.findRecord('document-type', CONFIG.decisionDocumentTypeId);
    } else {
      return null;
    }
  }),

  actions: {
    closeModal() {
      set(this, 'isAddingNewDocument', false);
      this.clearAllDocuments();
    },

    toggleIsAddingNewDocument() {
      this.toggleProperty('isAddingNewDocument');
    },

    async uploadNewDocument() {
      // TODO:fix-type
      const item = await this.get('item');
      const documents = await this.saveDocuments(null);
      // const documentType = await this.get('documentTypeToAssign');
      this.send('closeModal');

      await Promise.all(
        documents.map(async (document) => {
          // document.set('type', documentType);
          document.set(this.modelToAddDocumentVersionTo, item);
          item.set('signedDocument', document);
        })
      );
      await item.save();
    },

    delete() {
      // TODO: fix me
    },
  },
});
