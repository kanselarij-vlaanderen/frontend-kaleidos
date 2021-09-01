import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DocumentController extends Controller {
  @service router;

  @action
  transitionBack() {
    // If no route where you returned from go to the home page
    if (history.length > 1) {
      history.back();
    } else {
      this.router.transitionTo('agendas');
    }
  }

  @action
  resetPiece(piece) {
    this.model.name = piece.name;
    this.model.documentContainer.type = piece.docType;
    this.model.accessLevel = piece.accessLevel;
    this.model.confidential = piece.confidentiality;
  }

  @action
  openNewPiece(piece) {
    this.model = piece;
  }
}
