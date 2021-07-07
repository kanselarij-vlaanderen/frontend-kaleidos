/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

const COLUMN_MAP = {
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
};

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  queryParams = [{
    qpSortingString: {
      as: 'volgorde',
    },
  }];
  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name, prepended with minus if descending */
  qpSortingString = '';

  @tracked publicationFlow;
  @tracked publicationSubcase;
  @tracked selectedPieces = [];
  @tracked sortingString = undefined;
  @tracked isProofRequestModalOpen = false;
  @tracked proofRequestStage;

  initSort() {
    this.sortingString = this.qpSortingString;
    this.sort(this.sortingString);
  }

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieces.length;
  }

  get isRequestingDisabled() {
    return this.selectedPieces.length === 0;
  }

  @action
  togglePieceSelection(selectedPiece) {
    const isPieceSelected = this.selectedPieces.includes(selectedPiece);
    if (isPieceSelected) {
      this.selectedPieces.removeObject(selectedPiece);
    } else {
      this.selectedPieces.pushObject(selectedPiece);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieces = [];
    } else {
      this.selectedPieces = [...this.model];
    }
  }

  @action
  changeSorting(sortingString) {
    this.sortingString = sortingString;
    this.set('qpSortingString', sortingString);
    this.sort(sortingString);
    // sort is not tracked by ember
    this.model.arrayContentDidChange();
  }

  sort(sortingString) {
    let property = 'created';
    let isDescending = false;
    if (sortingString) {
      isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      property = COLUMN_MAP[sortKey]?.property || property;
    }

    // this.model.sortBy(property) does not work properly
    this.model.sort((piece1, piece2) => piece1[property] - piece2[property]);
    if (isDescending) {
      this.model.reverse();
    }
  }

  @action
  openProofRequestModal(stage) {
    if (stage === 'initial') {
      this.proofRequestStage = stage;
      this.isProofRequestModalOpen = true;
    }
  }

  @action
  closeProofRequestModal() {
    this.isProofRequestModalOpen = false;
  }

  @action
  async saveProofRequest(requestProperties) {
    try {
      await this.persistProofRequest(requestProperties);
    } finally {
      this.isProofRequestModalOpen = false;
    }
    this.selectedPieces = [];
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  async persistProofRequest(proofRequest) {
    if (proofRequest.stage === 'initial') {
      const now = new Date();

      const saves = [];

      if (!this.publicationSubcase.startDate) {
        this.publicationSubcase.startDate = now;
        const publicationSubcaseSave = this.publicationSubcase.save();
        saves.push(publicationSubcaseSave);
      }

      const requestActivity = this.store.createRecord('request-activity', {
        startDate: now,
        title: proofRequest.subject,
        publicationSubcase: this.publicationSubcase,
        usedPieces: proofRequest.attachments,
      });
      await requestActivity.save();

      const proofingActivity = this.store.createRecord('proofing-activity', {
        startDate: now,
        title: proofRequest.subject,
        subcase: this.publicationSubcase,
        requestActivity: requestActivity,
        usedPieces: proofRequest.attachments,
      });
      const proofingActivitySave = proofingActivity.save();
      saves.push(proofingActivitySave);

      const filePromises = proofRequest.attachments.mapBy('file');
      const attachmentFilesPromise = Promise.all(filePromises);
      const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
      const mailSettingsPromise = this.store.queryOne('email-notification-setting');
      const [attachmentFiles, outbox, mailSettings] = await Promise.all([attachmentFilesPromise, outboxPromise, mailSettingsPromise]);
      const email = this.store.createRecord('email', {
        to: mailSettings.proofRequestToEmail,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: proofRequest.subject,
        message: proofRequest.message,
        attachments: attachmentFiles,
        requestActivity: requestActivity,
      });
      const emailSave = email.save();
      saves.push(emailSave);

      await Promise.all(saves);
    }
  }

  @action
  openPieceUploadModal() {
    // TODO
  }
}
