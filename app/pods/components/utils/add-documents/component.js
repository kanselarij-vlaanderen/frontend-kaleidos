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
  @tracked isAddingNewPiece: null,
  isLoading: false,
  pieceInCreation: null,
  meetingRecordOrDecision: null,

  documentTypeToAssign: computed('modelToAddPieceTo', function() {
    const {
      modelToAddPieceTo,
    } = this;
    if (modelToAddPieceTo === 'agendaItemTreatment') {
      return this.store.findRecord('document-type', CONFIG.decisionDocumentTypeId);
    }
    return null;
  }),
  defaultAccessLevel: null, // when creating a new document

  async didInsertElement() {
    this._super(...arguments);
    this.set('pieceInCreation', null);
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

  async savePiece() {
    this.set('isLoading', true);
    const piece = this.get('pieceInCreation');
    await piece.save();
    const container = await piece.get('documentContainer.content'); // TODO: cannot use .content
    container.set('pieces', A([piece]));
    await container.save();

    this.set('pieceInCreation', null);
    this.set('isLoading', false);
    return piece;
  },

  actions: {
    closeModal() {
      set(this, 'isAddingNewPiece', false);
      this.clearAllDocuments();
    },

    toggleIsAddingNewPiece() {
      this.toggleProperty('isAddingNewPiece');
    },

    async uploadNewPiece() {
      const meetingRecordOrDecision = await this.get('meetingRecordOrDecision');
      const piece = await this.savePiece();
      await piece.belongsTo('documentContainer').reload();
      const documentType = await this.get('documentTypeToAssign');
      this.send('closeModal');

      const container = await piece.get('documentContainer');
      if (documentType) {
        container.set('type', documentType);
        await container.save();
      }

      piece.set(this.modelToAddPieceTo, meetingRecordOrDecision);
      meetingRecordOrDecision.set('report', piece);
      await meetingRecordOrDecision.save();
    },

    async deleteFile(file) {
      await this.fileService.deleteFile(file);
      this.clearAllDocuments();
    },

    async uploadedFile(uploadedFile) {
      const creationDate = moment().utc()
        .toDate();
      if (!this.defaultAccessLevel) {
        this.defaultAccessLevel = await this.store.findRecord('access-level', CONFIG.internRegeringAccessLevelId);
      }
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
