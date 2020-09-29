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

export default Component.extend({
  store: inject(),
  fileService: service(),
  currentSession: inject(),
  classNames: ['vl-u-spacer'],
  @tracked isAddingNewDocumentContainer: null,
  isLoading: null,
  pieceInCreation: null,
  meetingRecordOrDecision: null,

  documentTypeToAssign: computed('modelToAddPieceTo', function() {
    const {
      modelToAddPieceTo,
    } = this;
    if (modelToAddPieceTo === 'signedMinutes') {
      return this.store.findRecord('document-type', CONFIG.minuteDocumentTypeId);
    } else if (modelToAddPieceTo === 'agendaItemTreatment') {
      return this.store.findRecord('document-type', CONFIG.decisionDocumentTypeId);
    }
    return null;
  }),
  defaultAccessLevel: null, // when creating a new piece

  async didInsertElement() {
    this._super(...arguments);
    this.set('pieceInCreation', null);
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
    set(this, 'pieceInCreation', null);
  },

  createNewPiece(uploadedFile, defaults) {
    const defaultPropsToSet = [
      'accessLevel',
      'confidential'
    ];
    const newPiece = this.store.createRecord('piece', {});
    defaultPropsToSet.forEach(async(key) => {
      newPiece.set(key, defaults[key]);
    });
    newPiece.set('file', uploadedFile);
    newPiece.set('name', uploadedFile.get('filenameWithoutExtension'));
    return newPiece;
  },

  async saveDocumentContainer() {
    this.set('isLoading', true);
    const piece = this.get('pieceInCreation');
    await piece.save();
    const container = piece.get('documentContainer.content'); // TODO: cannot use .content
    container.set('pieces', A([piece]));
    const savedDocumentContainer = await container.save();

    this.set('pieceInCreation', null);
    this.set('isLoading', false);
    return savedDocumentContainer;
  },

  actions: {
    closeModal() {
      set(this, 'isAddingNewDocumentContainer', false);
      this.clearAllDocuments();
    },

    toggleisAddingNewDocumentContainer() {
      this.toggleProperty('isAddingNewDocumentContainer');
    },

    async uploadNewDocumentContainer() {
      const meetingRecordOrDecision = await this.get('meetingRecordOrDecision');
      const documentContainer = await this.saveDocumentContainer();
      const documentType = await this.get('documentTypeToAssign');
      this.send('closeModal');
      if (documentType) {
        documentContainer.set('type', documentType);
      }
      documentContainer.set(this.modelToAddPieceTo, meetingRecordOrDecision);
      if (this.modelToAddPieceTo === 'signedMinutes') {
        meetingRecordOrDecision.set('signedDocumentContainer', documentContainer);
      } else if (this.modelToAddPieceTo === 'agendaItemTreatment') {
        meetingRecordOrDecision.set('report', documentContainer);
      }
      await meetingRecordOrDecision.save();
    },

    async deleteFile(file) {
      await this.fileService.deleteFile(file);
      this.clearAllDocuments();
    },

    async uploadedFile(uploadedFile) {
      const creationDate = moment().utc()
        .toDate();
      const newPiece = this.createNewPiece(uploadedFile, {
        accessLevel: this.defaultAccessLevel,
      });
      newPiece.set('created', creationDate);
      newPiece.set('modified', creationDate);
      const newContainer = this.store.createRecord('document-container', {
        created: creationDate,
      });
      newPiece.set('documentContainer', newContainer);
      this.set('pieceInCreation', newPiece);
    },
  },
});
