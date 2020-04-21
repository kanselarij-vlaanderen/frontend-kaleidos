import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import uploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Component.extend(
  isAuthenticatedMixin,
  uploadDocumentMixin,
  {
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
        this.deleteAll();
      },

      async toggleIsAddingNewDocument() {
        const itemType = this.item.get('constructor.modelName');
        if(itemType === "agendaitem" || itemType === "subcase") {
          await this.item.preEditOrSaveCheck();
        }
        this.toggleProperty('isAddingNewDocument');
      },

      async toggleIsEditing() {
        const itemType = this.item.get('constructor.modelName');
        if(itemType === "agendaitem" || itemType === "subcase") {
          await this.item.preEditOrSaveCheck();
        }
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

      async saveDocumentContainers() {
        const documentContainers = await this.saveDocumentContainers();
        this.set('isLoading', true);
        const item = await this.get('item');

        const subcase = await item.get('subcase');
        const agendaitemsOnDesignAgenda = await item.get('agendaitemsOnDesignAgendaToEdit');

        try {
          let documentsToAttach = [];
          await Promise.all(
            documentContainers.map(async (container) => {
              const documents = await container.get('documentVersions');
              documents.map((document) => {
                documentsToAttach.push(document);
              })
            })
          );
          if (documentsToAttach) {
            if (subcase) {
              await this.addDocumentsToSubcase(documentsToAttach, subcase);
            } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
              await this.addDocumentsToAgendaitems(
                documentsToAttach,
                agendaitemsOnDesignAgenda
              );
            }
            await this.attachDocumentsToModel(documentsToAttach, item);
            await item.save();
          }
        } catch(error) {
          this.deleteAll();
          throw error;
        } finally {
          this.set('isLoading', false);
          this.set('isAddingNewDocument', false);
        }
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
        try {
          let documentsToAttach = [];
          await Promise.all(
            documents.map(async (document) => {
              const documentContainer = await document.get('documentContainer');
              const documents = await documentContainer.get('documentVersions');
              documents.map((document) => {
                documentsToAttach.push(document);
              })
            })
          );

          if (subcase) {
            await this.linkDocumentsToSubcase(documentsToAttach, subcase);
          } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
            await this.linkDocumentsToAgendaitems(documentsToAttach, agendaitemsOnDesignAgenda);
          }
          await this.attachDocumentsToModel(documentsToAttach, item, 'linkedDocumentVersions');
          await item.save();

        } catch(error) {
          throw error;
        } finally {
          this.set('isLinkingOldDocument', false);
          this.set('documentsToLink', A([]));
        }
      },
    },

    async addDocumentsToAgendaitems(documents, agendaitems) {
      return Promise.all(
        agendaitems.map(async (agendaitem) => {
          await this.attachDocumentsToModel(documents, agendaitem);
          return await agendaitem.save();
        })
      );
    },

    async addDocumentsToSubcase(documents, subcase) {
      await this.attachDocumentsToModel(documents, subcase);
      return await subcase.save();
    },

    async linkDocumentsToAgendaitems(documents, agendaitems) {
      return Promise.all(
        agendaitems.map(async (agendaitem) => {
          await this.attachDocumentsToModel(documents, agendaitem, 'linkedDocumentVersions');
          return await agendaitem.save();
        })
      );
    },

    async linkDocumentsToSubcase(documents, subcase) {
      await this.attachDocumentsToModel(documents, subcase, 'linkedDocumentVersions');
      return await subcase.save();
    }
  }
);
