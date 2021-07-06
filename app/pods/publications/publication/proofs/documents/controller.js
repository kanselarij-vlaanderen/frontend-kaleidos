/* eslint-disable no-dupe-class-members */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

const COLUMN_MAP = {
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
};

const REQUEST_STAGES = {
  INITIAL: 'initial',
  EXTRA: 'extra',
  FINAL: 'final',
};

export default class PublicationsPublicationProofsDocumentsController extends Controller {
  queryParams = [{
    qpSortingString: {
      as: 'volgorde',
    },
  }];
  // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} key name, prepended with minus if descending */
  qpSortingString;

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

  get canOpenProofRequestModal() {
    return this.selectedPieces.length > 0;
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
    let isDescending = true;
    if (sortingString) {
      isDescending = sortingString.startsWith('-');
      const sortKey = sortingString.substr(isDescending);
      property = COLUMN_MAP[sortKey] || property;
    }

    // this.model.sortBy(property) does not work properly
    this.model.sort((piece1, piece2) => piece1[property] - piece2[property]);
    if (isDescending) {
      this.model.reverse();
    }
  }

  @action
  openProofRequestModal(stage) {
    this.proofRequestStage = stage;
    this.isRequestModalOpen = true;
  }

  @action
  closeProofRequestModal() {
    this.isProofRequestModalOpen = false;
  }

  @action
  async saveProofRequest(requestProperties) {
    try {
      await this.performSaveProofRequest(requestProperties);
    } finally {
      this.isProofRequestModalOpen = false;
    }
    this.selectedPieces = [];
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  async performSaveProofRequest(proofRequest) {
    const now = new Date();

    // REQUEST ACTIVITY
    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      title: proofRequest.subject,
      publicationSubcase: proofRequest.publicationSubcase,
      usedPieces: proofRequest.attachments,
    });
    await requestActivity.save();

    // RESULT ACTIVITY
    const activityProperties = {
      startDate: now,
      title: proofRequest.subject,
      subcase: proofRequest.publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: proofRequest.attachments,
    };
    let activity;
    if (proofRequest.stage === REQUEST_STAGES.INITIAL) {
      activity = this.store.createRecord('proofing-activity', activityProperties);
    } else if (proofRequest.stage === REQUEST_STAGES.FINAL) {
      activity = this.store.createRecord('publication-activity', activityProperties);
    } else {
      throw new Error(`unknown request stage: ${proofRequest.stage}`);
    }
    const activitySave = activity.save();
    const saves = [activitySave];

    // PUBLICATION SUBCASE
    if (!proofRequest.publicationSubcase.startDate) {
      proofRequest.publicationSubcase.startDate = now;
      const publicationSubcaseSave = proofRequest.publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    // EMAIL
    const filePromises = proofRequest.attachments.mapBy('file');
    const filesPromise = Promise.all(filePromises);
    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = await Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      subject: proofRequest.subject,
      message: proofRequest.message,
      attachments: files,
      requestActivity: requestActivity,
    });
    const emailSave = mail.save();
    saves.push(emailSave);

    await Promise.all(saves);
  }
}
