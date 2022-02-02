import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const COLUMN_MAP = {
  naam: 'name',
  'ontvangen-op': 'receivedDate',
  'geupload-op': 'created',
};

export default class PublicationsPublicationTranslationsController extends Controller {
  @service store;
  @tracked publicationFlow;
  @tracked translationSubcase;
  @tracked publicationSubcase;
  @tracked selectedRequestActivity;
  @tracked showTranslationUploadModal = false;

  get isUploadDisabled() {
    return this.translationSubcase.isFinished;
  }

  get pieceRows() {
    let property = 'date';
    let isDescending = false;
    if (this.sort) {
      isDescending = this.sort.startsWith('-');
      const sortKey = this.sort.substr(isDescending);
      property = COLUMN_MAP[sortKey] ?? property;
    }

    let pieceRows = this.model;
    pieceRows = pieceRows.sortBy(`piece.${property}`);
    if (isDescending) {
      pieceRows = pieceRows.reverseObjects();
    }

    return pieceRows;
  }

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieceRows.length;
  }

  get selectedPieces() {
    return this.selectedPieceRows.map((row) => row.piece);
  }

  get isRequestingDisabled() {
    return this.selectedPieceRows.length === 0 // no files are selected
      || this.translationSubcase.isFinished;
  }

  get canDeletePieces() {
    return !this.translationSubcase.isFinished;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    yield documentContainer.save();

    const translationActivity = yield this.selectedRequestActivity
      .translationActivity;
    // triggers call
    const language = yield translationActivity.language;
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      receivedDate: translationUpload.receivedAtDate,
      confidential: false,
      name: translationUpload.name,
      file: translationUpload.file,
      documentContainer: documentContainer,
      language: language,
      translationActivityGeneratedBy: translationActivity,
    });
    if (translationUpload.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    }
    const pieceSave = piece.save();

    translationActivity.endDate = now;
    const translationActivitySave = translationActivity.save();

    if (
      translationUpload.receivedAtDate < this.translationSubcase.receivedDate ||
      !this.translationSubcase.receivedDate
    ) {
      this.translationSubcase.receivedDate = translationUpload.receivedAtDate;
      yield this.translationSubcase.save();
    }

    yield Promise.all([translationActivitySave, pieceSave]);

    this.showTranslationUploadModal = false;
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();
    if (!this.translationSubcase.startDate) {
      this.translationSubcase.startDate = now;
    }
    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    yield this.translationSubcase.save();

    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: translationRequest.attachments,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const pieces = translationRequest.attachments;
    const translationActivity = yield this.store.createRecord('translation-activity', {
      startDate: now,
      dueDate: translationRequest.translationDueDate,
      title: translationRequest.subject,
      subcase: this.translationSubcase,
      requestActivity: requestActivity,
      usedPieces: pieces,
      language: french,
    });
    yield translationActivity.save();

    const filePromises = translationRequest.attachments.mapBy('file');
    const filesPromise = Promise.all(filePromises);

    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files, outbox, mailSettings] = yield Promise.all([filesPromise, outboxPromise, mailSettingsPromise]);
    const mail = yield this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      message: translationRequest.message,
    });
    yield mail.save();

    this.selectedPieceRows = [];
    this.isTranslationRequestModalOpen = false;
  }

  @task
  *saveEditSourceDocument(translationDocument) {
    const piece = this.pieceRowToEdit.piece;
    piece.pages = translationDocument.pagesAmount;
    piece.words = translationDocument.wordsAmount;
    piece.name = translationDocument.name;

    if (translationDocument.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    } else {
      piece.publicationSubcaseSourceFor = null;
    }

    yield piece.save();
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

    yield Promise.all([destroyPiece, destroyFile, destroyDocumentContainer]);

    this.send('refresh');
  }

  @task
  *saveSourceDocument(translationDocument) {
    const piece = translationDocument.piece;
    piece.translationSubcaseSourceFor = this.translationSubcase;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.pages = translationDocument.pagesAmount;
    piece.words = translationDocument.wordsAmount;
    piece.name = translationDocument.name;
    piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

    if (translationDocument.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    }

    yield piece.save();
    this.isPieceUploadModalOpen = false;
    this.send('refresh');
  }

  @action
  openTranslationUploadModal(requestActivity) {
    this.selectedRequestActivity = requestActivity;
    this.showTranslationUploadModal = true;
  }

  @action
  closeTranslationUploadModal() {
    this.selectedRequestActivity = null;
    this.showTranslationUploadModal = false;
  }

  @action
  togglePieceSelection(selectedPieceRow) {
    const isPieceSelected = this.selectedPieceRows.includes(selectedPieceRow);
    if (isPieceSelected) {
      this.selectedPieceRows.removeObject(selectedPieceRow);
    } else {
      this.selectedPieceRows.pushObject(selectedPieceRow);
    }
  }

  @action
  toggleAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieceRows = [];
    } else {
      this.selectedPieceRows = [...this.model];
    }
  }

  @action
  openPieceUploadModal() {
    this.isPieceUploadModalOpen = true;
  }

  @action
  closePieceUploadModal() {
    this.isPieceUploadModalOpen = false;
  }

  @action
  openPieceEditModal(pieceRow) {
    this.pieceRowToEdit = pieceRow;
    this.showPieceEditModal = true;
  }

  @action
  closePieceEditModal() {
    this.pieceRowToEdit = null;
    this.showPieceEditModal = false;
  }

  @action
  openTranslationRequestModal() {
    this.isTranslationRequestModalOpen = true;
  }

  @action
  closeTranslationRequestModal() {
    this.isTranslationRequestModalOpen = false;
  }
}
