import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationTranslationsRequestController extends Controller {
  @service store;

  @tracked translationSubcase;
  @tracked publicationFlow;

  @tracked showTranslationUploadModal = false;

  @task
  *saveTranslationUpload(translationUpload) {
    const piece = translationUpload.piece;
    const requestActivity = translationUpload.requestActivity;
    const translationActivity = yield requestActivity.translationActivity;

    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();

    piece.translationSubcase = this.translationSubcase;
    piece.pages = translationUpload.pagesAmount;
    piece.words = translationUpload.wordsAmount;
    piece.name = translationUpload.name;
    piece.language = requestActivity.language;
    yield piece.save();

    translationActivity.endDate = translationUpload.receivedAtDate;
    yield  translationActivity.generatedPieces;
    if (translationActivity.generatedPieces) {
      translationActivity.generatedPieces.pushObject(piece);
    } else {
      translationActivity.generatedPieces = [piece];
    }
    yield translationActivity.save();

    this.showTranslationUploadModal = false;
    this.send('refresh');
  }

  @action
  openTranslationUploadModal() {
    this.showTranslationUploadModal = true;
  }

  @action
  closeTranslationUploadModal() {
    this.showTranslationUploadModal = false;
  }
}
