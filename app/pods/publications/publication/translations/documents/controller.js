import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PublicationTranslationDocumentController extends Controller {
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
}
