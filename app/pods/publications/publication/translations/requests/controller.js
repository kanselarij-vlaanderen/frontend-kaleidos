import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationTranslationsRequestController extends Controller {
  @service store;

  @tracked publicationSubcase;
  @tracked translationSubcase;
  @tracked selectedRequestActivity;
  @tracked showTranslationUploadModal = false;

  @task
  *saveTranslationUpload(translationUpload) {
    const piece = translationUpload.piece;
    const translationActivity = yield this.selectedRequestActivity.translationActivity;

    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();

    piece.name = translationUpload.name;
    piece.language = yield translationActivity.language;
    if (translationUpload.proofprint) {
      piece.publicationSubcase = this.publicationSubcase;
    }
    yield piece.save();

    translationActivity.endDate = translationUpload.receivedAtDate;
    const generatedPieces = yield translationActivity.generatedPieces;
    generatedPieces.pushObject(piece);
    yield translationActivity.save();

    this.showTranslationUploadModal = false;
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
}
