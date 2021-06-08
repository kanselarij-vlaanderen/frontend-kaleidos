import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationTranslationsDocumentController extends Controller {
  @tracked translationSubcase;
  @tracked publicationFlow;
  @tracked identification;
  @tracked showPieceUploadModal = false;
  @tracked showTranslationRequestModal = false;
  @tracked selectedPieces = [];

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;
  @service store;

  get areAllPiecesSelected() {
    return this.model.length === this.selectedPieces.length;
  }

  @action
  changePieceSelection(selectedPiece) {
    const isPieceSelected = this.selectedPieces.includes(selectedPiece);
    if (isPieceSelected) {
      this.selectedPieces.removeObject(selectedPiece);
    } else {
      this.selectedPieces.pushObject(selectedPiece);
    }
  }

  @action
  changeAllPiecesSelection() {
    if (this.areAllPiecesSelected) {
      this.selectedPieces = [];
    } else {
      this.selectedPieces = [...this.model];
    }
  }

  @action
  openPieceUploadModal() {
    this.showPieceUploadModal = true;
  }

  @task
  *saveAndLinkPieces(translationDocument) {
    const piece = translationDocument.piece;
    piece.translationSubcase = this.translationSubcase;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.pages = translationDocument.pagesAmount;
    piece.words = translationDocument.wordsAmount;
    piece.name = translationDocument.name;
    piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

    yield piece.save();

    this.showPieceUploadModal = false;
    this.send('refresh');
  }

  @action
  hidePieceUploadModal() {
    this.showPieceUploadModal = false;
  }

  @action
  openTranslationRequestModal() {
    this.showTranslationRequestModal = true;
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();
    if (this.translationSubcase.startDate === null) {
      this.translationSubcase.startDate = now;
    }
    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    yield this.translationSubcase.save();

    const requestActivity = yield  this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: translationRequest.selectedPieces,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const pieces = translationRequest.selectedPieces;
    const translationActivity = yield  this.store.createRecord('translation-activity', {
      startDate: now,
      dueDate: translationRequest.translationDueDate,
      title: translationRequest.subject,
      subcase: this.translationSubcase,
      requestActivity: requestActivity,
      usedPieces: pieces,
      language: french,
    });
    yield translationActivity.save();

    const filePromises = translationRequest.selectedPieces.mapBy('file');
    const files = yield Promise.all(filePromises);

    const folder = yield this.store.findRecord('mail-folder', CONFIG.EMAIL.OUTBOX.ID);
    const mail = yield this.store.createRecord('email', {
      to: CONFIG.EMAIL.TO.translationsEmail,
      from: CONFIG.EMAIL.DEFAULT_FROM,
      folder: folder,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      content: translationRequest.message,
    });
    yield mail.save();

    this.showTranslationRequestModal = false;
    this.send('refresh');
  }

  @action
  hideTranslationRequestModal() {
    this.showTranslationRequestModal = false;
  }
}
