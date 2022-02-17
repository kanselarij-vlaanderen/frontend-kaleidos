import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty } from '@ember/utils';

export default class  PublicationsPublicationProofsController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked showProofUploadModal = false;
  @tracked showProofRequestModal = false;

  get isRequestingDisabled() {
    return this.publicationSubcase.isFinished;
  }

  get isProofUploadDisabled() {
    return this.model.length === 0;
  }

  @task
  *saveProofUpload(proofUpload) {
    // get latest proofing activity
    const proofingActivity = this.model.filter((activity) => !isEmpty(activity.proofingActivity))[0].proofingActivity;

    // triggers call
    const language = yield proofingActivity.language;

    const pieceSaves = [];
    for (let piece of proofUpload.generatedPieces){

      piece.receivedDate = proofUpload.receivedAtDate;
      piece.language = language;
      piece.proofingActivityGeneratedBy= proofingActivity;

      pieceSaves.push(piece.save());
    }

    proofingActivity.endDate = proofUpload.receivedAtDate;
    const proofingActivitySave = proofingActivity.save();

    if (
      proofUpload.receivedAtDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofUpload.receivedAtDate;
      yield this.publicationSubcase.save();
    }

    if (proofUpload.isProofIn) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_IN,
        proofUpload.receivedAtDate
      );

      this.publicationSubcase.endDate = proofUpload.receivedAtDate;
      yield this.publicationSubcase.save();
    }

    yield Promise.all([proofingActivitySave, pieceSaves]);

    this.send('refresh');
    this.showProofUploadModal = false;
  }

  @task
  *saveProofRequest(proofRequest) {
    const now = new Date();

    const usedPieces = [];

    for (let piece of proofRequest.usedPieces){
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
      const documentContainer = yield piece.documentContainer;
      yield documentContainer.save();
      piece.pages = proofRequest.pagesAmount;
      piece.words = proofRequest.wordsAmount;
      piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

      yield piece.save();
      usedPieces.push(piece);
    }

    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: this.publicationSubcase,
      usedPieces: usedPieces,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const proofingActivity = yield this.store.createRecord('proofing-activity', {
      startDate: now,
      dueDate: proofRequest.proofDueDate,
      title: proofRequest.subject,
      subcase: this.publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: usedPieces,
      language: french,
    });
    yield proofingActivity.save();

    const filePromises = usedPieces.mapBy('file');
    const filesPromise = Promise.all(filePromises);

    const outboxPromise = this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const mailSettingsPromise = this.store.queryOne('email-notification-setting');
    const [files,outbox, mailSettings] = yield Promise.all([filesPromise,outboxPromise, mailSettingsPromise]);
    const mail = yield this.store.createRecord('email', {
      to: mailSettings.proofRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: proofRequest.subject,
      message: proofRequest.message,
    });
    yield mail.save();

    // PUBLICATION-STATUS
    const pubStatusChange = this.publicationService.updatePublicationStatus(
      this.publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS
    );
    yield pubStatusChange;

    this.send('refresh');
    this.showProofRequestModal = false;
  }

  @task
  *deleteRequest(requestActivity){
    const saves = [];

    const proofingActivity = yield requestActivity.proofingActivity;
    saves.push(proofingActivity.destroyRecord());

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
  openProofUploadModal() {
    this.showProofUploadModal = true;
  }

  @action
  closeProofUploadModal() {
    this.showProofUploadModal = false;
  }

  @action
  openProofRequestModal() {
    this.showProofRequestModal = true;
  }

  @action
  closeProofRequestModal() {
    this.showProofRequestModal = false;
  }
}
