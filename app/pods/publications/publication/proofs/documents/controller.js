import Controller from '@ember/controller';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import {
  action,
  computed,
  set
} from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const COLUMN_MAP = {
  naam: 'name',
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
    sort: {
      as: 'volgorde',
    },
  }];
  @service currentPublicationFlow;
  @service currentSession;
  @service store;

  // @tracked sort; // TODO: don't do tracking on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  /** @type {string} kebab-cased key name, prepended with minus if descending */
  sort;

  @tracked publicationSubcase;
  @tracked selectedPieceRows = [];
  @tracked isProofRequestModalOpen = false;
  @tracked proofRequestStage;
  @tracked isPieceUploadModalOpen = false;
  @tracked isPieceUploadCorrected;
  @tracked isPieceEditModalOpen = false;
  @tracked pieceRowToEdit;

  @computed('sort', 'model.pieceRows') // TODO: remove @computed once this.sort is marked as @tracked
  get pieceRows() {
    let property = 'created';
    let isDescending = false;
    if (this.sort) {
      isDescending = this.sort.startsWith('-');
      const sortKey = this.sort.substr(isDescending);
      property = COLUMN_MAP[sortKey] ?? property;
    }

    let pieceRows = this.model.pieceRows;
    pieceRows = pieceRows.sortBy(`piece.${property}`);
    if (isDescending) {
      pieceRows = pieceRows.reverseObjects();
    }

    return pieceRows;
  }

  get areAllPiecesSelected() {
    return this.model.pieceRows.length === this.selectedPieceRows.length;
  }

  get selectedPieces() {
    return this.selectedPieceRows.map((row) => row.piece);
  }

  get isRequestingDisabled() {
    return this.selectedPieceRows.length === 0
      || this.publicationSubcase.isFinished;
  }

  get isUploadDisabled() {
    return this.publicationSubcase.isFinished;
  }

  get canDeletePieces() {
    return !this.publicationSubcase.isFinished;
  }

  @action
  togglePieceSelection(pieceRow) {
    const isPieceSelected = this.selectedPieceRows.includes(pieceRow);
    if (isPieceSelected) {
      this.selectedPieceRows.removeObject(pieceRow);
    } else {
      this.selectedPieceRows.pushObject(pieceRow);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieceRows = [];
    } else {
      this.selectedPieceRows = [...this.model.pieceRows];
    }
  }

  @action
  changeSorting(sort) {
    // TODO: remove setter once "sort" is tracked
    set(this, 'sort', sort);
  }

  @action
  openProofRequestModal(stage) {
    this.proofRequestStage = stage;
    this.isProofRequestModalOpen = true;
  }

  @action
  closeProofRequestModal() {
    this.isProofRequestModalOpen = false;
  }

  @action
  async saveProofRequest(requestProperties) {
    await this.performSaveProofRequest(requestProperties);
    this.selectedPieceRows = [];
    this.isProofRequestModalOpen = false;
    this.transitionToRoute('publications.publication.proofs.requests');
  }

  @action
  openSourceUploadModal() {
    this.isPieceUploadModalOpen = true;
  }

  @action
  openCorrectionUploadModal() {
    this.isPieceUploadModalOpen = true;
    this.isPieceUploadCorrected = true;
  }

  @action
  closePieceUploadModal() {
    this.isPieceUploadModalOpen = false;
    this.isPieceUploadCorrected = false;
  }

  @action
  async savePieceUpload(proofDocument) {
    await this.performSavePieceUpload(proofDocument, this.isPieceUploadCorrected);

    this.closePieceUploadModal();
    this.send('refresh');
  }

  @action
  openPieceEditModal(pieceRow) {
    this.pieceRowToEdit = pieceRow;
    this.isPieceEditModalOpen = true;
  }

  @action
  closePieceEditModal() {
    this.pieceRowToEdit = null;
    this.isPieceEditModalOpen = false;
  }

  @action
  async savePieceEdit(modalResult) {
    const piece = this.pieceRowToEdit.piece;
    piece.name = modalResult.name;
    piece.receivedDate = modalResult.receivedAtDate;
    await piece.save();

    this.closePieceEditModal();
    this.send('refresh');
  }

  @task
  *deletePiece(pieceRow) {
    const piece = pieceRow.piece;
    const filePromise = piece.file;
    const documentContainerPromise = piece.documentContainer;
    const [file, documentContainer] = yield Promise.all([filePromise, documentContainerPromise]);

    const destroyPiece = piece.destroyRecord();
    const destroyFile = file.destroyRecord();
    const destroyDocumentContainer = documentContainer.destroyRecord();

    yield Promise.all([destroyFile, destroyPiece, destroyDocumentContainer]);

    this.send('refresh');
  }

  async performSaveProofRequest(proofRequest) {
    const now = new Date();
    const saves = [];

    // PUBLICATION SUBCASE
    if (!this.publicationSubcase.startDate) {
      this.publicationSubcase.startDate = now;
      const publicationSubcaseSave = this.publicationSubcase.save();
      saves.push(publicationSubcaseSave);
    }

    // REQUEST ACTIVITY
    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      title: proofRequest.subject,
      publicationSubcase: this.publicationSubcase,
      usedPieces: proofRequest.attachments,
    });
    await requestActivity.save();

    // RESULT ACTIVITY
    const activityProperties = {
      startDate: now,
      title: proofRequest.subject,
      subcase: this.publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: proofRequest.attachments,
    };
    let activity;
    if (proofRequest.stage === REQUEST_STAGES.INITIAL
      || proofRequest.stage === REQUEST_STAGES.EXTRA) {
      activity = this.store.createRecord('proofing-activity', activityProperties);
    } else if (proofRequest.stage === REQUEST_STAGES.FINAL) {
      activity = this.store.createRecord('publication-activity', activityProperties);
    } else {
      throw new Error(`unknown request stage: ${proofRequest.stage}`);
    }
    const activitySave = activity.save();
    saves.push(activitySave);

    // EMAIL
    const filePromises = proofRequest.attachments.mapBy('file');
    const filesPromise = Promise.all(filePromises);
    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = await Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      cc: mailSettings.proofRequestCcEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      subject: proofRequest.subject,
      message: proofRequest.message,
      attachments: files,
      requestActivity: requestActivity,
    });
    const emailSave = mail.save();
    saves.push(emailSave);

    // PUBLICATION-STATUS
    this.currentPublicationFlow.publicationFlow.status =  await this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED);
    const statusSave = this.currentPublicationFlow.save();
    saves.push(statusSave);

    const oldChangeActivity = await this.currentPublicationFlow.publicationFlow.publicationStatusChange;
    if (oldChangeActivity) {
      await oldChangeActivity.destroyRecord();
    }
    const newChangeActivity = this.store.createRecord('publication-status-change', {
      startedAt: now,
      publication: this.currentPublicationFlow.publicationFlow,
    });
    const statusChangedSave = newChangeActivity.save();
    saves.push(statusChangedSave)

    await Promise.all(saves);
    this.currentPublicationFlow.reload();
  }

  async performSavePieceUpload(uploadProperties, isCorrection) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();

    const pieceProperties = {
      created: now,
      modified: now,
      name: uploadProperties.name,
      confidential: false,
      file: uploadProperties.file,
      documentContainer: documentContainer,
    };

    if (isCorrection) {
      pieceProperties.publicationSubcaseCorrectionFor = this.publicationSubcase;
    } else {
      pieceProperties.publicationSubcaseSourceFor = this.publicationSubcase;
    }
    const piece = this.store.createRecord('piece', pieceProperties);
    await piece.save();

    return piece;
  }
}
