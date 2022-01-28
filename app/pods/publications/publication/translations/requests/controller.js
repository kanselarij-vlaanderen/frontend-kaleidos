import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsRequestController extends Controller {
  @service store;
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

    const translationActivity = yield this.selectedRequestActivity
      .translationActivity;
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
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    }
    const pieceSave = piece.save();

    translationActivity.endDate = now;
    const translationActivitySave = translationActivity.save();

    if (
      translationUpload.receivedAtDate < this.translationSubcase.receivedDate ||
      !this.translationSubcase.receivedDate
    ) {
      this.translationSubcase.receivedDate = translationUpload.receivedAtDate;
      yield this.translationSubcase.save();
    }

    if (translationUpload.isTranslationIn) {
      this.publicationFlow.status =  yield this.store.findRecordByUri('publication-status', CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_IN);
      yield this.publicationFlow.save();

      const oldChangeActivity = yield this.publicationFlow.publicationStatusChange;
      if (oldChangeActivity) {
        yield oldChangeActivity.destroyRecord();
      }
      const newChangeActivity = this.store.createRecord('publication-status-change', {
        startedAt: translationUpload.receivedAtDate,
        publication: this.publicationFlow,
      });
      yield newChangeActivity.save();

      this.translationSubcase.endDate = translationUpload.receivedAtDate;
      yield this.translationSubcase.save();
    }

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
