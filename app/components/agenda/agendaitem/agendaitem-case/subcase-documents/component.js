import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import moment from 'moment';
import config from 'fe-redpencil/utils/config';
import { deprecatingAlias } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';

export default Component.extend(
  {
    currentSession: inject(),
    classNames: ['vl-u-spacer--large'],

    store: service(),
    documentsInCreation: A([]), // When creating new documents

    isAddingNewDocument: false,
    isEditing: false,
    isLoading: false,
    shouldShowLinkedDocuments: true,
    item: null,
    documentsToLink: A([]),
    model: alias('uploadedFiles'),

    document: deprecatingAlias('documentContainer', {
      id: 'model-refactor.documents',
      until: '?'
    }),
    documentContainer: null, // When adding a new version to an existing document
    defaultAccessLevel: null, // when creating a new document

    init() {
      this._super(...arguments);
      this.set('model', A([]));
      this.store.query('document-type', { sort: 'priority', 'page[size]': 50 }).then(types => {
        this.set('documentTypes', types);
      });
    },

    async didInsertElement() {
      this._super(...arguments);
      this.set('documentsInCreation', A([]));
      const accessLevels = await this.store.findAll('access-level');
      try {
        this.set('defaultAccessLevel', accessLevels.find((item) => {
          return item.id == config.internRegeringAccessLevelId;
        }));
      } catch (e) {
        // TODO error during cypress tests:
        // calling set on destroyed object: <fe-redpencil@component:item-document::ember796>.defaultAccessLevel
      }
    },

    createNewDocument(uploadedFile, previousDocument, defaults) {
      const propsFromPrevious = [
        'accessLevel',
        'confidential'
      ];
      const newDocument = this.store.createRecord('document-version', {});
      propsFromPrevious.forEach(async key => {
        newDocument.set(key, previousDocument ?
          await previousDocument.getWithDefault(key, defaults[key]) :
          defaults[key]
        );
      });
      newDocument.set('file', uploadedFile);
      newDocument.set('previousVersion', previousDocument);
      newDocument.set('name', uploadedFile.get('filenameWithoutExtension'));
      return newDocument;
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

    async attachDocumentsToModel(documents, model, propertyName = 'documentVersions') {
      const modelName = await model.get('constructor.modelName');
      // Don't do anything for these models
      if (['meeting-record', 'decision'].includes(modelName)) {
        return model;
      }

      const modelDocumentVersions = await model.get(propertyName);
      if (modelDocumentVersions) {
        model.set(
          propertyName,
          A(Array.prototype.concat(modelDocumentVersions.toArray(), documents.toArray()))
        );
      } else {
        model.set(propertyName, documents);
      }
      return model;
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
    },

    actions: {
      async uploadedFile(uploadedFile) {
        const creationDate = moment().utc().toDate();
        if (this.documentContainer) {
          await this.documentContainer.reload();
          await this.documentContainer.hasMany('documents').reload();
        }
        const previousVersion = this.documentContainer ? (await this.documentContainer.get('lastDocumentVersion')) : null;
        const newDocument = this.createNewDocument(uploadedFile, previousVersion, {
          accessLevel: this.defaultAccessLevel,
        });
        newDocument.set('created', creationDate);
        newDocument.set('modified', creationDate);
        if (this.documentContainer) { // Adding new version to existing container
          const docs = await this.documentContainer.get('documents');
          docs.pushObject(newDocument);
          newDocument.set('documentContainer', this.documentContainer); // Explicitly set relation both ways
          const newName = new VRDocumentName(previousVersion.get('name')).withOtherVersionSuffix(docs.length);
          newDocument.set('name', newName);
          this.documentContainer.notifyPropertyChange('documents'); // Why exactly? Ember should handle this?
        } else { // Adding new version, new container
          const newContainer = this.store.createRecord('document', {
            'created': creationDate
          });
          newDocument.set('documentContainer', newContainer);
          this.get('documentsInCreation').pushObject(newDocument);
        }
      },

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

      chooseDocumentType(document, type) {
        document.set('type', type);
      },

      async saveDocumentContainers() {
        if (arguments.length > 0) {
          deprecate('The function \'saveDocumentContainers\' takes no arguments, \'confidential\' should be set on individual document level', true);
        }
        this.set('isLoading', true);
        const docs = this.get('documentsInCreation');

        const documentContainers = await Promise.all(
          docs.map(async (doc) => {
            doc = await doc.save();
            let container = doc.get('documentContainer.content'); // TODO: cannot use .content
            container.set('documents', A([doc]));
            await container.save();
            return container;
          })
        );

        this.get('documentsInCreation').clear();
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
  }
);
