import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty } from '@ember/utils';

export default class PublicationsPublicationTranslationsIndexController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked translationSubcase;

  @tracked showTranslationUploadModal = false;
  @tracked showTranslationRequestModal = false;

  get isRequestingDisabled() {
    return this.translationSubcase.isFinished;
  }

  get isTranslationUploadDisabled() {
    return isEmpty(this.latestTranslationActivity);
  }

  get latestTranslationActivity() {
    return this.model.length !== 0 ? this.model.find((timeLineActivity) => timeLineActivity.isTranslationActivity).activity : null;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const translationActivity = this.latestTranslationActivity;

    const pieceSaves = [];
    const containerSaves = [];

    for (let piece of translationUpload.uploadedPieces) {
      piece.receivedDate = translationUpload.receivedAtDate;
      piece.language = yield translationActivity.language;
      piece.translationActivityGeneratedBy = translationActivity;
      pieceSaves.push(piece.save());

      const documentContainer = yield piece.documentContainer;
      containerSaves.push(documentContainer.save());
    }

    translationActivity.endDate = translationUpload.receivedAtDate;
    const translationActivitySave = translationActivity.save();

    let translationSubcaseSave;
    if (
      translationUpload.receivedAtDate < this.translationSubcase.receivedDate ||
      !this.translationSubcase.receivedDate
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
      pieceSaves,
      containerSaves,
      translationSubcaseSave,
    ]);

    this.send('refresh');
    this.showTranslationUploadModal = false;
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();

    for (let piece of translationRequest.uploadedPieces) {
      piece.translationSubcaseSourceFor = this.translationSubcase;
      piece.language = yield this.store.findRecordByUri(
        'language',
        CONSTANTS.LANGUAGES.NL
      );
      yield piece.save();
    }

    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: translationRequest.uploadedPieces,
    });
    yield requestActivity.save();

    const translationActivity = yield this.store.createRecord(
      'translation-activity',
      {
        startDate: now,
        dueDate: translationRequest.translationDueDate,
        title: translationRequest.subject,
        subcase: this.translationSubcase,
        requestActivity: requestActivity,
        usedPieces: translationRequest.uploadedPieces,
        language: yield this.store.findRecordByUri(
          'language',
          CONSTANTS.LANGUAGES.FR
        ),
      }
    );
    yield translationActivity.save();

    const [files, outbox, mailSettings] = yield Promise.all([
      translationRequest.uploadedPieces.mapBy('file'),
      this.store.findRecordByUri(
        'mail-folder',
        PUBLICATION_EMAIL.OUTBOX
      ),
      this.store.queryOne(
        'email-notification-setting'
      ),
    ]);
    const mail = yield this.store.createRecord('email', {
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

  @dropTask
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const translationActivity = yield requestActivity.translationActivity;
    deletePromises.push(translationActivity.destroyRecord());

    const mail = yield requestActivity.email;
    deletePromises.push(mail.destroyRecord());

    deletePromises.push(requestActivity.destroyRecord());

    const pieces = yield requestActivity.usedPieces;

    for (const piece of pieces.toArray()) {
      const filePromise = piece.file;
      const documentContainerPromise = piece.documentContainer;
      const [file, documentContainer] = yield Promise.all([
        filePromise,
        documentContainerPromise,
      ]);

      deletePromises.push(piece.destroyRecord());
      deletePromises.push(file.destroyRecord());
      deletePromises.push(documentContainer.destroyRecord());
    }
    yield Promise.all(deletePromises);
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
