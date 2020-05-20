import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import { downloadFilePrompt } from 'fe-redpencil/utils/file-utils';
import { A } from '@ember/array';
import { set } from '@ember/object';
import { deprecatingAlias } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';

export default Component.extend({
  intl: service(),
  toaster: service(),
  fileService: service(),
  currentSession: service(),
  store: service(),
  documentsInCreation: A([]), // When creating new documents

  async didInsertElement() {
    this._super(...arguments);
    await this.resetPreferredAccessLevel();
  },

  classNames: ['vlc-document-card-item'],
  classNameBindings: ['aboutToDelete'],
  documentVersion: null,
  isEditingAccessLevel: false,
  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  documentContainer: null, // When adding a new version to an existing document
  defaultAccessLevel: null, // when creating a new document

  aboutToDelete: computed('documentVersion.aboutToDelete', function () {
    if (this.documentVersion) {
      if (this.documentVersion.get('aboutToDelete')) {
        return 'vlc-document--deleted-state';
      }
    }
  }),

  preferredAccessLevel: null,

  clearAllDocuments() {
    set(this, 'documentsInCreation', A([]));
  },

  resetPreferredAccessLevel: async function () {
    this.set('preferredAccessLevel', await this.documentVersion.get('accessLevel'));
  },

  async deleteDocument(document) {
    await this.fileService.deleteDocument(document)
  },

  async deleteDocumentVersion(documentVersion) {
    await this.fileService.deleteDocumentVersion(documentVersion);
  },

  async deleteFile(file) {
    await this.fileService.deleteFile(file);
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
    })
    newDocument.set('file', uploadedFile);
    newDocument.set('previousVersion', previousDocument);
    newDocument.set('name', uploadedFile.get('filenameWithoutExtension'));
    return newDocument;
  },

  async saveDocumentContainers() {
    if (arguments.length > 0) {
      deprecate('The function \'saveDocumentContainers\' takes no arguments, \'confidential\' should be set on individual document level', true);
    }
    this.set('isLoading', true);
    const docs = this.get('documentsInCreation');

    const savedDocuments = await Promise.all(
      docs.map(async (doc) => {
        doc = await doc.save();
        let container = doc.get('documentContainer.content'); // TODO: cannot use .content
        container.set('documents', A([doc]));
        await container.save();
        return container;
      })
    );

    this.get('documentsInCreation').clear();
    this.set('isLoading', false);
    return savedDocuments;
  },

  async saveDocuments() {
    deprecate('\'saveDocuments\' is deprecated by saveDocumentContainers', true);
    return this.saveDocumentContainers(...arguments);
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

  async attachDocumentVersionsToModel() {
    deprecate('\'attachDocumentVersionsToModel\' is deprecated by attachDocumentsToModel', true);
    return this.attachDocumentsToModel(...arguments);
  },

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkDocumentVersions(documentVersions, model) {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'decision'].includes(modelName)) {
      return model;
    }
    const subcase = await model.get('subcase');
    const agendaitemsOnDesignAgenda = await model.get('agendaitemsOnDesignAgendaToEdit');
    if (subcase) {
      await this.unlinkDocumentVersionsFromModel(subcase, documentVersions);
    } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
      await Promise.all(agendaitemsOnDesignAgenda.map(agendaitem => this.unlinkDocumentVersionsFromModel(agendaitem, documentVersions)));
    }
    return await this.unlinkDocumentVersionsFromModel(model, documentVersions);
  },

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkDocumentVersionsFromModel(model, documentVersions) {
    const modelDocumentVersions = await model.get('linkedDocumentVersions');
    if (modelDocumentVersions) {
      documentVersions.forEach(documentVersion => modelDocumentVersions.removeObject(documentVersion))
    } else {
      model.set('linkedDocumentVersions', A([]));
    }
    return await model.save();
  },

  actions: {
    cancel() {
      this.set('documentVersionToDelete', null);
      this.set('isVerifyingDelete', false);
    },

    verify() {
      const verificationToast = {
        type: 'revert-action',
        title: this.intl.t('warning-title'),
        message: this.intl.t('document-being-deleted'),
        options: { timeOut: 15000 }
      };
      verificationToast.options.onUndo = () => {
        this.fileService.reverseDelete(this.documentVersionToDelete.get('id'));
        this.toaster.toasts.removeObject(verificationToast);
      };
      this.toaster.displayToast.perform(verificationToast);
      this.deleteDocumentVersionWithUndo();
      this.set('isVerifyingDelete', false);
    },

    deleteDocumentVersion(document) {
      this.set('documentVersionToDelete', document);
      this.set('isVerifyingDelete', true);
    },

    async toggleConfidential(document) {
      document.toggleProperty('confidential');
      await document.save();
    },

    chooseAccessLevel(accessLevel) {
      this.set('preferredAccessLevel', accessLevel);
    },

    async saveChanges() {
      let preferredAccessLevel = this.get('preferredAccessLevel');
      this.toggleProperty('isEditingAccessLevel');
      let documentVersion = this.get('documentVersion');
      if (preferredAccessLevel) {
        await documentVersion.set('accessLevel', preferredAccessLevel);
        await documentVersion.save();
      }
      this.resetPreferredAccessLevel();
    },

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

    async downloadFile(version) {
      const doc = await version;
      let file = await doc.get('file');
      downloadFilePrompt(this, file, doc.get('name'));
    },

    async removeDocument(documentContainer) {
      const file = await documentContainer.get('documents.firstObject.file');
      if (file.get('id')) {
        file.destroyRecord();
      }
      documentContainer.get('documents.firstObject').rollbackAttributes();
      documentContainer.rollbackAttributes();
    },

    async showDocumentVersionViewer(documentVersion) {
      window.open(`/document/${(await documentVersion).get('id')}`);
    },
  },

  async deleteDocumentVersionWithUndo() {
    const documentVersionToDelete = this.get('documentVersionToDelete');

    // TODO somehow this no longer works, document returns null or undefined
    // const document = await documentVersionToDelete.get('documentContainer');
    // const documentVersions = await document.get('documents');

    // TODO fix the deletion of document-container when last version is deleted so it doesn't become an orphan
    // if(documentVersions.length > 1) {
      await this.fileService.get('deleteDocumentVersionWithUndo').perform(documentVersionToDelete);
    // }else {
    //   const documentToDelete = document;
    //   await this.fileService.get('deleteDocumentWithUndo').perform(documentToDelete).then(() => {
    //     if(!this.item.aboutToDelete && documentVersions) {
    //       this.item.hasMany('documentVersions').reload();
    //     }
    //   });
    // }
  },
});
