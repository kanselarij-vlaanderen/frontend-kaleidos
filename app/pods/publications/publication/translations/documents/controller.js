import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsDocumentController extends Controller {
  @tracked translationSubcase;
  @tracked showPieceUploadModal = false;
  @tracked selectedPieces = [];

  // Editing of pieces.
  @tracked pieceBeingEdited = null;
  @tracked showPieceEditor = false;

  // Hacky way to refresh the checkboxes in the view without reloading the route.
  @tracked renderPieces = true;
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
}
