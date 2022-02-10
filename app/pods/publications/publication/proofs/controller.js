import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class  PublicationsPublicationProofsController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked showProofUploadModal = false;
  @tracked showProofRequestModal = false;

  get isRequestingDisabled() {
    return this.proofSubcase.isFinished;
  }

  get isProofUploadDisabled() {
    return this.model.length === 0;
  }

  @task
  *saveProofUpload(proofUpload) {
    const now = new Date();

    // get latest Req activity
    const requestActivity = this.model.filter((row) =>row.requestActivity !== null).sortBy('date').reverseObjects()[0].requestActivity;

    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    yield documentContainer.save();

    const proofActivity = yield requestActivity.proofActivity;

    // triggers call
    const language = yield proofActivity.language;
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      receivedDate: proofUpload.receivedAtDate,
      confidential: false,
      name: proofUpload.name,
      file: proofUpload.file,
      documentContainer: documentContainer,
      language: language,
      proofActivityGeneratedBy: proofActivity,
    });
    if (proofUpload.isSourceForProofPrint) {
      piece.publicationSubcaseSourceFor = this.publicationSubcase;
    }
    const pieceSave = piece.save();

    proofActivity.endDate = now;
    const proofActivitySave = proofActivity.save();

    if (
      proofUpload.receivedAtDate < this.proofSubcase.receivedDate ||
      !this.proofSubcase.receivedDate
    ) {
      this.proofSubcase.receivedDate = proofUpload.receivedAtDate;
      yield this.proofSubcase.save();
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

    yield Promise.all([proofActivitySave, pieceSave]);

    this.send('refresh');
    this.showProofUploadModal = false;
  }

  @task
  *saveProofRequest(proofRequest) {
    const now = new Date();

    const piece = proofRequest.piece;
    piece.proofSubcaseSourceFor = this.proofSubcase;
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.pages = proofRequest.pagesAmount;
    piece.words = proofRequest.wordsAmount;
    piece.name = proofRequest.name;
    piece.language = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);

    yield piece.save();
    const usedPieces = [piece];
    console.log(usedPieces)
    const requestActivity = yield this.store.createRecord('request-activity', {
      startDate: now,
      proofSubcase: this.proofSubcase,
      usedPieces: usedPieces,
    });
    yield requestActivity.save();
    const french = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.FR);

    const proofActivity = yield this.store.createRecord('proof-activity', {
      startDate: now,
      dueDate: proofRequest.proofDueDate,
      title: proofRequest.subject,
      subcase: this.proofSubcase,
      requestActivity: requestActivity,
      usedPieces: usedPieces,
      language: french,
    });
    yield proofActivity.save();

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

    const proofActivity = yield requestActivity.proofActivity;
    saves.push(proofActivity.destroyRecord());

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
