import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import uploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';

export default Controller.extend(isAuthenticatedMixin, ModifiedMixin, uploadDocumentMixin, {
  globalError: inject(),
  classNames: ['vl-u-spacer--large'],
  isAddingNewDocument: false,
  isEditing: false,
  isLoading: false,
  item: null,

  model: alias('uploadedFiles'),

  init() {
    this._super(...arguments);
    this.set('model', A([]));
  },

  actions: {
    delete(document) {
      this.deleteDocument(document).then(() => {
        this.get('documentsInCreation').removeObject(document);
      });
    },

    add(file) {
      this.get('model').pushObject(file);
      this.send('uploadedFile', file);
    },

    async deleteAll() {
      await Promise.all(
        this.get('documentsInCreation').map((document) => {
          return this.deleteDocument(document).then(() => {
            this.get('documentsInCreation').removeObject(document);
          });
        })
      );
      this.set('isAddingNewDocument', false);
    },

    toggleIsAddingNewDocument() {
      this.toggleProperty('isAddingNewDocument');
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    cancelEditing() {
      this.toggleProperty('isEditing');
    },

    refreshRoute() {
      this.send('refresh');
    },

    async saveDocuments() {
      const documents = await this.saveDocuments(null);
      const meeting = await this.get('item');

      await Promise.all(
        documents.map(async (document) => {
          const documentVersions = await document.get('documentVersions');
          return this.addDocumentVersionsToMeeting(documentVersions, meeting);
        })
      );

      meeting.save().then(() => {
        this.set('isAddingNewDocument', false);
      });
    },
	},
	
  async addDocumentVersionsToMeeting(documentVersions, meeting) {
    await this.attachDocumentVersionsToModel(documentVersions, meeting);
    return meeting.save();
  },
});
