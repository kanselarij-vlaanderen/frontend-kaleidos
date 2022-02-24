import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsIndexController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked translationSubcase;

  @tracked showTranslationUploadModal = false;
  @tracked showTranslationRequestModal = false;

  get isTranslationUploadDisabled() {
    return this.latestTranslationActivity == null;
  }

  get latestTranslationActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isTranslationActivity
    );
    return timelineActivity ? timelineActivity.activity : null;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const translationActivity = this.latestTranslationActivity;

    const pieceSaves = [];

    const language = yield translationActivity.language;
    for (let piece of translationUpload.uploadedPieces) {
      piece.receivedDate = translationUpload.receivedAtDate;
      piece.language = language;
      piece.translationActivityGeneratedBy = translationActivity;
      pieceSaves.push(piece.save());
    }

    translationActivity.endDate = translationUpload.receivedAtDate;
    const translationActivitySave = translationActivity.save();

    let translationSubcaseSave;
    if (
      !this.translationSubcase.receivedDate ||
      translationUpload.receivedAtDate < this.translationSubcase.receivedDate
    ) {
      this.translationSubcase.receivedDate = translationUpload.receivedAtDate;
      translationSubcaseSave = this.translationSubcase.save();
    }

    if (translationUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_IN,
        translationUpload.receivedAtDate
      );

      this.translationSubcase.endDate = translationUpload.receivedAtDate;
      translationSubcaseSave = this.translationSubcase.save();
    }

    yield Promise.all([
      translationActivitySave,
      ...pieceSaves,
      translationSubcaseSave,
    ]);

    this.send('refresh');
    this.showTranslationUploadModal = false;
  }

  @task
  *saveTranslationActivityEdit(translationActivity, endDate) {
    translationActivity.endDate = endDate;
    yield translationActivity.save();
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();

    const uploadedPieces = translationRequest.uploadedPieces;
    const dutch = yield this.store.findRecordByUri(
      'language',
      CONSTANTS.LANGUAGES.NL
    );
    yield Promise.all(
      uploadedPieces.map((piece) => {
        piece.translationSubcaseSourceFor = this.translationSubcase;
        piece.language = dutch;
        return piece.save();
      })
    );

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: uploadedPieces,
    });
    yield requestActivity.save();

    const translationActivity = this.store.createRecord(
      'translation-activity',
      {
        startDate: now,
        dueDate: translationRequest.translationDueDate,
        title: translationRequest.subject,
        subcase: this.translationSubcase,
        requestActivity: requestActivity,
        usedPieces: uploadedPieces,
        language: yield this.store.findRecordByUri(
          'language',
          CONSTANTS.LANGUAGES.FR
        ),
      }
    );
    yield translationActivity.save();

    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    if (this.translationSubcase.hasDirtyAttributes) {
      yield this.translationSubcase.save();
    }

    const [files, outbox, mailSettings] = yield Promise.all([
      Promise.all(uploadedPieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      message: translationRequest.message,
    });
    yield mail.save();

    // PUBLICATION-STATUS
    yield this.publicationService.updatePublicationStatus(
      this.publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS
    );

    this.send('refresh');
    this.showTranslationRequestModal = false;
  }

  @task
  *deleteRequest(requestActivity) {
    const translationActivity = yield requestActivity.translationActivity;
    yield translationActivity.destroyRecord();

    const mail = yield requestActivity.email;
    yield mail?.destroyRecord();

    const pieces = yield requestActivity.usedPieces;
    for (const piece of pieces.toArray()) {
      const file = yield piece.file;
      const documentContainer = yield piece.documentContainer;
      yield file.destroyRecord();
      yield documentContainer.destroyRecord();
      yield piece.destroyRecord()
    }
    yield requestActivity.destroyRecord();
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

  @action
  openTranslationRequestModal() {
    this.showTranslationRequestModal = true;
  }

  @action
  closeTranslationRequestModal() {
    this.showTranslationRequestModal = false;
  }
}
