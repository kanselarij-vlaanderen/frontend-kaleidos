import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked translationSubcase;
  @tracked publicationSubcase;

  @tracked showTranslationUploadModal = false;
  @tracked showTranslationRequestModal = false;

  get isRequestingDisabled() {
    return this.translationSubcase.isFinished;
  }

  get isTranslationUploadDisabled() {
    return this.model.length === 0;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const now = new Date();

    // get latest Req activity
    const requestActivity = this.model.filter((row) =>row.requestActivity !== null).sortBy('date').reverseObjects()[0].requestActivity;

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    yield documentContainer.save();

    const translationActivity = yield requestActivity.translationActivity;

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
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_IN,
        translationUpload.receivedAtDate
      );

      this.publicationSubcase.endDate = translationUpload.receivedAtDate;
      yield this.publicationSubcase.save();
    }

    yield Promise.all([translationActivitySave, pieceSave]);

    this.send('refresh');
    this.showTranslationUploadModal = false;
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();

    const piece = translationRequest.piece;
    piece.translationSubcaseSourceFor = this.translationSubcase;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.pages = translationRequest.pagesAmount;
    piece.words = translationRequest.wordsAmount;
    piece.name = translationRequest.name;
    piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

    yield piece.save();
    const usedPieces = [piece];
    console.log(usedPieces)
    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: usedPieces,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const translationActivity = yield this.store.createRecord('translation-activity', {
      startDate: now,
      dueDate: translationRequest.translationDueDate,
      title: translationRequest.subject,
      subcase: this.translationSubcase,
      requestActivity: requestActivity,
      usedPieces: usedPieces,
      language: french,
    });
    yield translationActivity.save();

    const filePromises = usedPieces.mapBy('file');
    const filesPromise = Promise.all(filePromises);

    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files,outbox, mailSettings] = yield Promise.all([filesPromise,outboxPromise, mailSettingsPromise]);
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
    const pubStatusChange = this.publicationService.updatePublicationStatus(
      this.publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS
    );
    yield pubStatusChange;

    this.send('refresh');
    this.showTranslationRequestModal = false;
  }

  @task
  *deleteRequest(requestActivity){
    const saves = [];

    const translationActivity = yield requestActivity.translationActivity;
    saves.push(translationActivity.destroyRecord());

    const mail = yield requestActivity.email;
    saves.push(mail.destroyRecord());

    saves.push(requestActivity.destroyRecord());

    const pieces = yield requestActivity.usedPieces;

    for (const piece of pieces.toArray()) {
      const filePromise = piece.file;
      const documentContainerPromise = piece.documentContainer;
      const [file, documentContainer] = yield Promise.all([filePromise, documentContainerPromise]);

      saves.push(piece.destroyRecord());
      saves.push(file.destroyRecord());
      saves.push(documentContainer.destroyRecord());
    }
    yield Promise.all(saves);
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
