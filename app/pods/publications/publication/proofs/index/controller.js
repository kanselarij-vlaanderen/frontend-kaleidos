import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationProofsController extends Controller {
  @service router;
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;
  @tracked publicationActivitiesCount;

  @tracked showProofUploadModal = false;
  @tracked showProofRequestModal = false;

  get isCreatePublicationRequestDisabled() {
    return this.publicationActivitiesCount > 0;
  }

  get latestProofingActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isProofingActivity
    );
    return timelineActivity ? timelineActivity.activity : null;
  }

  @task
  *saveProofUpload(proofUpload) {
    let proofingActivity = this.latestProofingActivity;

    if (!proofingActivity) {
      // Uploading proof documents without a request
      proofingActivity = this.store.createRecord('proofing-activity', {
        startDate: new Date(),
        subcase: this.publicationSubcase,
      });
    }

    proofingActivity.endDate = proofUpload.receivedDate;
    yield proofingActivity.save();

    const pieceSaves = [];
    for (let piece of proofUpload.pieces) {
      piece.receivedDate = proofUpload.receivedDate;
      piece.proofingActivityGeneratedBy = proofingActivity;
      pieceSaves.push(piece.save());
    }

    let publicationSubcaseSave;
    if (proofUpload.proofPrintCorrector) {
      this.publicationSubcase.proofPrintCorrector =
        proofUpload.proofPrintCorrector;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.changePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PROOF_RECEIVED,
        proofUpload.receivedDate
      );

      this.publicationSubcase.endDate = proofUpload.receivedDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    yield Promise.all([
      ...pieceSaves,
      publicationSubcaseSave,
    ]);

    this.send('refresh');
    this.showProofUploadModal = false;
  }

  @task
  *saveProofRequest(proofRequest) {
    yield this.publicationService.createProofRequest(
      proofRequest,
      this.publicationFlow
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
      // The pieces that are used in a translationActivity can not be deleted
      const [translationActivitiesUsedBy, translationActivityGeneratedBy] =
        yield Promise.all([
          piece.translationActivitiesUsedBy,
          piece.translationActivityGeneratedBy,
        ]);
      const isLinkedToTranslation =
        translationActivitiesUsedBy.length > 0 ||
        // non-existent model relationships resolve to null
        !!translationActivityGeneratedBy;
      if (!isLinkedToTranslation) {
        yield this.publicationService.deletePiece(piece);
      }
    }
    yield requestActivity.destroyRecord();
    this.send('refresh');
  }

  @task
  *editProofingActivity(proofEdit) {
    const saves = [];

    const proofingActivity = proofEdit.proofingActivity;
    proofingActivity.endDate = proofEdit.receivedDate;
    saves.push(proofingActivity.save());

    this.publicationSubcase.proofPrintCorrector = proofEdit.proofPrintCorrector;
    saves.push(this.publicationSubcase.save());

    yield Promise.all(saves);
    this.send('refresh');
  }

  @task
  *savePublicationRequest(publicationRequest) {
    yield this.publicationService.createPublicationRequest(
      publicationRequest,
      this.publicationFlow
    );

    this.router.transitionTo('publications.publication.publication-activities');
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
