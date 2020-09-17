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

export default Component.extend({
  store: inject(),
  fileService: service(),
  currentSession: inject(),
  classNames: ['vl-u-spacer'],
  @tracked isAddingDocument: null,
  @tracked isAddingNewDocument: null,
  isLoading: false,
  documentInCreation: null, // When creating new documents

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
    this.set('documentInCreation', null);
    const accessLevels = await this.store.findAll('access-level');
    try {
      this.set('defaultAccessLevel', accessLevels.find((item) => item.id === CONFIG.internRegeringAccessLevelId));
    } catch (exception) {
      console.warn('An exception occurred', exception);
      // TODO error during cypress tests:
      // calling set on destroyed object: <fe-redpencil@component:item-document::ember796>.defaultAccessLevel
    }
  },

  clearAllDocuments() {
    set(this, 'documentInCreation', null);
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

  async saveDocument() {
    this.set('isLoading', true);
    let doc = this.get('documentInCreation');
    doc = await doc.save();
    const container = await doc.get('documentContainer.content'); // TODO: cannot use .content
    container.set('documents', A([doc]));
    await container.save();

    this.set('documentInCreation', null);
    this.set('isLoading', false);
    return doc;
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
      const document = await this.saveDocument();
      await document.belongsTo('documentContainer').reload();
      const documentType = await this.get('documentTypeToAssign');
      this.send('closeModal');

      const container = await document.documentContainer;
      if (documentType) {
        container.set('type', documentType);
        await container.save();
      }

      document.set(this.modelToAddDocumentVersionTo, meetingRecordOrDecision);
      meetingRecordOrDecision.set('report', document);
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
      if (!this.defaultAccessLevel) {
        this.defaultAccessLevel = await this.store.findRecord('access-level', CONFIG.internRegeringAccessLevelId);
      }
      const newDocument = this.createNewDocument(uploadedFile, null, {
        accessLevel: this.defaultAccessLevel,
      });
      newDocument.set('created', creationDate);
      newDocument.set('modified', creationDate);
      const newContainer = this.store.createRecord('document', {
        created: creationDate,
      });
      newDocument.set('documentContainer', newContainer);
      this.set('documentInCreation', newDocument);
    },
  },
});
