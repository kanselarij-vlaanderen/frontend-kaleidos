import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import uploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend(
  EditAgendaitemOrSubcase,
  isAuthenticatedMixin,
  ModifiedMixin,
  uploadDocumentMixin,
  {
    globalError: inject(),
    classNames: ['vl-u-spacer--large'],
    isAddingNewDocument: false,
    isEditing: false,
    isLoading: false,
    item: null,
    isDesignAgenda: null,

    model: alias('uploadedFiles'),

    init() {
      this._super(...arguments);
      this.set('model', A([]));
    },

    actions: {
      delete(file) {
        file.destroyRecord().then(() => {
          this.get('model').removeObject(file);
        });
      },

      add(file) {
        this.get('model').pushObject(file);
        this.send('uploadedFile', file);
      },

      cancel() {
        this.get('model').invoke('destroyRecord');
        if (this.onCancel) {
          this.onCancel(...arguments);
        }
      },

      toggleIsAddingNewDocument() {
        this.set('isAddingNewDocument', true);
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
        const item = await this.get('item');

        await Promise.all(
          documents.map(async (document) => {
            const documentVersions = await document.get('documentVersions');
            return this.attachDocumentVersionsToModel(documentVersions, item);
          })
        );
        item.save().then(() => {
          this.set('isAddingNewDocument', false);
        });
      },
    },
  }
);
