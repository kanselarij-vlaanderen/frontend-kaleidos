import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsDocumentController extends Controller {
  @tracked publicationFlow;
  @tracked translationSubcase;
  @tracked publicationSubcase;
  @tracked showPieceEditModal = false;
  @tracked selectedPieces = [];
  @tracked toEditDocument;
  @tracked isPieceUploadModalOpen = false;
  @tracked isTranslationRequestModalOpen = false;

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieces.length;
  }

  get isRequestingDisabled() {
    return this.selectedPieces.length === 0 // no files are selected
      || this.translationSubcase.isFinished;
  }

  get isUploadDisabled() {
    return this.translationSubcase.isFinished;
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

  @task
  *saveSourceDocument(translationDocument) {
    const piece = translationDocument.piece;
    piece.translationSubcase = this.translationSubcase;
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


  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();
    if (this.translationSubcase.startDate === null) {
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
    const filesPromise = yield Promise.all(filePromises);

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

    this.selectedPieces = [];
    this.isTranslationRequestModalOpen = false;
    this.transitionToRoute('publications.publication.translations.requests');
  }

  @task
  *saveEditSourceDocument(translationDocument) {
    const piece = this.toEditDocument;
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
  *deletePiece(piece) {
    if (piece.isDeleted) {
      return;
    }

    // prevent piece from being used/rendered while delete is pending
    this.model.removeObject(piece);
    this.selectedPieces.removeObject(piece);

    const filePromise = piece.file;
    const documentContainerPromise = piece.documentContainer;
    const [file, documentContainer] = yield Promise.all([filePromise, documentContainerPromise]);

    const destroyPiece = piece.destroyRecord();
    const destroyFile = file.destroyRecord();
    const destroyDocumentContainer = documentContainer.destroyRecord();

    yield Promise.all([destroyPiece, destroyFile, destroyDocumentContainer]);

    this.send('refresh');
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
  openPieceEditModal(toEditDocument) {
    this.toEditDocument = toEditDocument;
    this.showPieceEditModal = true;
  }

  @action
  closePieceEditModal() {
    this.toEditDocument = null;
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
