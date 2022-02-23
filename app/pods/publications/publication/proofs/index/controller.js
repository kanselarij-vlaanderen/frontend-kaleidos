import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationProofsController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked showProofUploadModal = false;
  @tracked showProofRequestModal = false;

  get isProofUploadDisabled() {
    return this.latestProofingActivity == null;
  }

  get latestProofingActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isProofingActivity
    );
    return timelineActivity ? timelineActivity.activity : null;
  }

  @task
  *saveProofUpload(proofUpload) {
    const proofingActivity = this.latestProofingActivity;

    const pieceSaves = [];
    const language = yield proofingActivity.language;
    for (let piece of proofUpload.uploadedPieces) {
      piece.receivedDate = proofUpload.receivedAtDate;
      piece.language = language;
      piece.proofingActivityGeneratedBy = proofingActivity;
      pieceSaves.push(piece.save());
    }

    proofingActivity.endDate = proofUpload.receivedAtDate;
    const proofingActivitySave = proofingActivity.save();

    let publicationSubcaseSave;
    if (
      proofUpload.receivedAtDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofUpload.receivedAtDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.proofReader){
      this.publicationSubcase.proofPrintCorrector = proofUpload.proofReader;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
        proofUpload.receivedAtDate
      );

      this.publicationSubcase.endDate = proofUpload.receivedAtDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    yield Promise.all([
      proofingActivitySave,
      ...pieceSaves,
      publicationSubcaseSave,
    ]);

    this.send('refresh');
    this.showProofUploadModal = false;
  }

  @task
  *saveProofRequest(proofRequest) {
    const now = new Date();

    const uploadedPieces = proofRequest.uploadedPieces;
    const dutch = yield this.store.findRecordByUri(
      'language',
      CONSTANTS.LANGUAGES.NL
    );

    yield Promise.all(
      uploadedPieces.map((piece) => {
        piece.publicationSubcaseSourceFor = this.publicationSubcase;
        piece.language = dutch;
        return piece.save();
      })
    );

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      publicationSubcase: this.publicationSubcase,
      usedPieces: uploadedPieces,
    });
    yield requestActivity.save();

    const proofingActivity = this.store.createRecord('proofing-activity', {
      startDate: now,
      dueDate: proofRequest.proofDueDate,
      title: proofRequest.subject,
      subcase: this.publicationSubcase,
      requestActivity: requestActivity,
      usedPieces: uploadedPieces,
      language: yield this.store.findRecordByUri(
        'language',
        CONSTANTS.LANGUAGES.FR
      ),
    });
    yield proofingActivity.save();

    const [files, outbox, mailSettings] = yield Promise.all([
      Promise.all(uploadedPieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
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
    yield this.publicationService.updatePublicationStatus(
      this.publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED
    );

    this.send('refresh');
    this.showProofRequestModal = false;
  }

  @dropTask
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const proofingActivity = yield requestActivity.proofingActivity;
    deletePromises.push(proofingActivity.destroyRecord());

    const mail = yield requestActivity.email;
    if (mail) {
      deletePromises.push(mail.destroyRecord());
    }
    deletePromises.push(requestActivity.destroyRecord());

    const pieces = yield requestActivity.usedPieces;

    for (const piece of pieces.toArray()) {
      const [file, documentContainer] = yield Promise.all([
        piece.file,
        piece.documentContainer,
      ]);

      deletePromises.push(piece.destroyRecord());
      deletePromises.push(file.destroyRecord());
      deletePromises.push(documentContainer.destroyRecord());
    }
    yield Promise.all(deletePromises);
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
