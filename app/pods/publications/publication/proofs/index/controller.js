import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
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
      piece.receivedDate = proofUpload.receivedDate;
      piece.language = language;
      piece.proofingActivityGeneratedBy = proofingActivity;
      pieceSaves.push(piece.save());
    }

    proofingActivity.endDate = proofUpload.receivedDate;
    const proofingActivitySave = proofingActivity.save();

    let publicationSubcaseSave;
    if (
      proofUpload.receivedDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofUpload.receivedDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.proofPrintCorrector) {
      this.publicationSubcase.proofPrintCorrector =
        proofUpload.proofPrintCorrector;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
        proofUpload.receivedDate
      );

      this.publicationSubcase.endDate = proofUpload.receivedDate;
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

  @task
  *deleteRequest(requestActivity) {
    const proofingActivity = yield requestActivity.proofingActivity;
    yield proofingActivity.destroyRecord();

    const mail = yield requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    yield mail?.destroyRecord();

    const pieces = yield requestActivity.usedPieces;
    for (const piece of pieces.toArray()) {
      const file = yield piece.file;
      const documentContainer = yield piece.documentContainer;
      yield file.destroyRecord();
      yield documentContainer.destroyRecord();
      yield piece.destroyRecord();
    }
    yield requestActivity.destroyRecord();
    this.send('refresh');
  }

  @task
  *saveEditReceivedProof(proofEdit) {
    const saves = [];

    const proofingActivity = proofEdit.proofingActivity;
    proofingActivity.endDate = proofEdit.receivedDate;
    saves.push(proofingActivity.save());

    if (
      proofEdit.receivedDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofEdit.receivedDate;
    }
    this.publicationSubcase.proofPrintCorrector = proofEdit.proofPrintCorrector;
    saves.push(this.publicationSubcase.save());

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
