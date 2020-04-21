import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { downloadFilePrompt } from 'fe-redpencil/utils/file-utils';
import { A } from '@ember/array';
import { set } from '@ember/object';
import config from '../utils/config';
import { deprecatingAlias } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';

export default Mixin.create({
  store: service(),
  fileService: service(),

  documentsInCreation: A([]), // When creating new documents

  clearAllDocuments() {
    set(this, 'documentsInCreation', A([]));
  },

  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  documentContainer: null, // When adding a new version to an existing document
  defaultAccessLevel: null, // when creating a new document

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
});
