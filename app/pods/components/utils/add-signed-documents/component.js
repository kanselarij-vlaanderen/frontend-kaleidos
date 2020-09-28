import Component from '@ember/component';
import {
  inject, inject as service
} from '@ember/service';
import {
  computed, set
} from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import { tracked } from '@glimmer/tracking';

import moment from 'moment';
import { A } from '@ember/array';

import { deprecatingAlias } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';

export default Component.extend({
  store: inject(),
  fileService: service(),
  currentSession: inject(),
  classNames: ['vl-u-spacer'],
  @tracked isAddingDocument: null,
  @tracked isAddingNewDocument: null,
  isLoading: null,
  documentsInCreation: A([]), // When creating new documents
  meetingRecordOrDecision: null,

  documentTypeToAssign: computed('modelToAddDocumentVersionTo', function() {
    const {
      modelToAddDocumentVersionTo,
    } = this;
    if (modelToAddDocumentVersionTo === 'signedMinutes') {
      return this.store.findRecord('document-type', CONFIG.minuteDocumentTypeId);
    } else if (modelToAddDocumentVersionTo === 'agendaItemTreatment') {
      return this.store.findRecord('document-type', CONFIG.decisionDocumentTypeId);
    }
    return null;
  }),
  document: deprecatingAlias('documentContainer', {
    id: 'model-refactor.documents',
    until: '?',
  }),
  documentContainer: null, // When adding a new version to an existing document
  defaultAccessLevel: null, // when creating a new document

  async didInsertElement() {
    this._super(...arguments);
    this.set('documentsInCreation', A([]));
    const accessLevels = await this.store.findAll('access-level');
    try {
      this.set('defaultAccessLevel', accessLevels.find((accesslevel) => accesslevel.id === CONFIG.internRegeringAccessLevelId));
    } catch (exception) {
      console.warn('An exception occurred', exception);
      // TODO error during cypress tests:
      // calling set on destroyed object: <fe-redpencil@component:item-document::ember796>.defaultAccessLevel
    }
  },

  clearAllDocuments() {
    set(this, 'documentsInCreation', A([]));
  },

  createNewDocument(uploadedFile, previousDocument, defaults) {
    const propsFromPrevious = [
      'accessLevel',
      'confidential'
    ];
    const newDocument = this.store.createRecord('document-version', {});
    propsFromPrevious.forEach(async(key) => {
      newDocument.set(key, previousDocument
        ? await previousDocument.getWithDefault(key, defaults[key])
        : defaults[key]);
    });
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
      docs.map(async(doc) => {
        doc = await doc.save();
        const container = doc.get('documentContainer.content'); // TODO: cannot use .content
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

  actions: {
    closeModal() {
      set(this, 'isAddingNewDocument', false);
      this.clearAllDocuments();
    },

    toggleIsAddingNewDocument() {
      this.toggleProperty('isAddingNewDocument');
    },

    async uploadNewDocument() {
      const meetingRecordOrDecision = await this.get('meetingRecordOrDecision');
      const documents = await this.saveDocuments(null);
      const documentType = await this.get('documentTypeToAssign');
      this.send('closeModal');

      await Promise.all(
        documents.map(async(document) => {
          if (documentType) {
            document.set('type', documentType);
          }
          document.set(this.modelToAddDocumentVersionTo, meetingRecordOrDecision);
          if (this.modelToAddDocumentVersionTo === 'signedMinutes') {
            meetingRecordOrDecision.set('signedDocument', document);
          } else if (this.modelToAddDocumentVersionTo === 'agendaItemTreatment') {
            meetingRecordOrDecision.set('report', document);
          }
        })
      );
      await meetingRecordOrDecision.save();
    },

    async deleteFile(file) {
      // const deleteDocumentID = await document.get('id');
      await this.fileService.deleteFile(file);
      this.clearAllDocuments();
    },

    async uploadedFile(uploadedFile) {
      const creationDate = moment().utc()
        .toDate();
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
          created: creationDate,
        });
        newDocument.set('documentContainer', newContainer);
        this.get('documentsInCreation').pushObject(newDocument);
      }
    },
  },
});
