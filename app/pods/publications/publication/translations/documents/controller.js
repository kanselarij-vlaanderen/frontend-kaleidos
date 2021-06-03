import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationTranslationDocumentController extends Controller {
  @tracked showPieceUploadModal = false;

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

    piece.proofprint = translationDocument.proofprint;
    piece.receivedAtDate = translationDocument.receivedAtDate;
    piece.language = 'NL';

    yield piece.save();

    this.showPieceUploadModal = false;
  }

  @action
  hidePieceUploadModal() {
    this.showPieceUploadModal = false;
  }
}
