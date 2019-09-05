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
        const item = await this.get('item');

        const subcase = await item.get('subcase');
        const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');

        await Promise.all(
          documents.map(async (document) => {
            const documentVersions = await document.get('documentVersions');
            if (subcase) {
              await this.addDocumentVersionsToSubcase(documentVersions, subcase);
            } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
              await this.addDocumentVersionsToAgendaitems(
                documentVersions,
                agendaitemsOnDesignAgenda
              );
            }
            return this.attachDocumentVersionsToModel(documentVersions, item);
          })
        );

        item.save().then(() => {
          this.set('isAddingNewDocument', false);
        });
      },
    },

    async addDocumentVersionsToAgendaitems(documentVersions, agendaitems) {
      return Promise.all(
        agendaitems.map(async (agendaitem) => {
          await this.attachDocumentVersionsToModel(documentVersions, agendaitem);
          return agendaitem.save();
        })
      );
    },

    async addDocumentVersionsToSubcase(documentVersions, subcase) {
      await this.attachDocumentVersionsToModel(documentVersions, subcase);
      return subcase.save();
    }
  }
);
