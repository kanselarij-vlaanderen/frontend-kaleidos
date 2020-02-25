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
    shouldShowLinkedDocuments: true,
    item: null,
    documentsToLink: A([]),

    model: alias('uploadedFiles'),

    init() {
      this._super(...arguments);
      this.set('model', A([]));
    },

    actions: {
      async delete(doc) {
        const file = await doc.get('file');
        file.destroyRecord();
        this.get('documentsInCreation').removeObject(doc);
        const container = doc.get('documentContainer.content');
        container.deleteRecord();
        doc.deleteRecord();
      },

      add(file) {
        this.get('model').pushObject(file);
        this.send('uploadedFile', file);
      },

      async deleteAll() {
        await Promise.all(
          this.get('documentsInCreation').map(async (doc) => {
            const file = await doc.get('file');
            file.destroyRecord();
            const container = doc.get('documentContainer.content');
            container.deleteRecord();
            doc.deleteRecord();
          })
        );
        this.get('documentsInCreation').clear();
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

      chooseDocumentType(document, type) {
        document.set('type', type);
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

      toggleIsLinkingOldDocument() {
        this.toggleProperty('isLinkingOldDocument');
      },

      link(document) {
        this.get('documentsToLink').addObject(document);
      },

      unlink(document) {
        this.get('documentsToLink').removeObject(document);
      },

      async linkDocuments() {
        const documents = await this.get('documentsToLink');
        const item = await this.get('item');

        const subcase = await item.get('subcase');
        const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');

        await Promise.all(
          documents.map(async (document) => {
            const storedDocument = await this.store.findRecord('document', document.id);
            const documentVersions = await storedDocument.get('documentVersions');
            if (subcase) {
              await this.linkDocumentVersionsToSubcase(documentVersions, subcase);
            } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
              await this.linkDocumentVersionsToAgendaitems(documentVersions, agendaitemsOnDesignAgenda);
            }
            return this.attachDocumentVersionsToModel(documentVersions, item, 'linkedDocumentVersions');
          })
        );

        item.save().then(() => {
          this.set('isLinkingOldDocument', false);
          this.set('documentsToLink', A([]));
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
    },

    async linkDocumentVersionsToAgendaitems(documentVersions, agendaitems) {
      return Promise.all(
        agendaitems.map(async (agendaitem) => {
          await this.attachDocumentVersionsToModel(documentVersions, agendaitem, 'linkedDocumentVersions');
          return agendaitem.save();
        })
      );
    },

    async linkDocumentVersionsToSubcase(documentVersions, subcase) {
      await this.attachDocumentVersionsToModel(documentVersions, subcase, 'linkedDocumentVersions');
      return subcase.save();
    }
  }
);
