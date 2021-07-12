import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsRequestController extends Controller {
  @tracked publicationFlow;
  @tracked translationSubcase;
  @tracked publicationSubcase;
  @tracked selectedRequestActivity;
  @tracked showTranslationUploadModal = false;

  get isUploadDisabled() {
    return this.translationSubcase.isFinished;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const now = new Date();

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    yield documentContainer.save();

    const translationActivity = yield this.selectedRequestActivity.translationActivity;
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
      piece.publicationSubcase = this.publicationSubcase;
    }
    const pieceSave = piece.save();

    translationActivity.endDate = translationUpload.receivedAtDate;
    const translationActivitySave = translationActivity.save();

    yield Promise.all([translationActivitySave, pieceSave]);

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
