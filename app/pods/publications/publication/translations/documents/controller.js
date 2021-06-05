import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsDocumentController extends Controller {
  @tracked translationSubcase;
  @tracked showPieceUploadModal = false;

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
  openPieceUploadModal() {
    this.showPieceUploadModal = true;
  }

  @action
  closePieceUploadModal() {
    this.showPieceUploadModal = false;
  }
}
