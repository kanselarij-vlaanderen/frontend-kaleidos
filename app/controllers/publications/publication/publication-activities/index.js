import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// TODO
// For now, we limit the number of request- and publication-activities to 1
// We will need to figure out whether multiple publication-activities are possible

export default class PublicationsPublicationPublicationActivitiesIndexController extends Controller {
  @service store;
  @service publicationService;
  @service router;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked isOpenRequestModal = false;
  @tracked isOpenRegistrationModal = false;

  get latestPublicationActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isPublicationActivity
    );
    return timelineActivity?.activity;
  }

  // Currently only one publication request is allowed
  get isRequestDisabled() {
    return this.model.some((activity) => activity.isRequestActivity);
  }

  get isRegistrationDisabled() {
    return this.latestPublicationActivity?.isFinished;
  }

  @task
  *saveRequest(publicationRequest) {
    yield this.publicationService.createPublicationRequest(
      publicationRequest,
      this.publicationFlow
    );

    this.router.refresh('publications.publication.publication-activities');
    this.closeRequestModal();
  }

  @task
  *registerPublication(publication) {
    let publicationActivity = this.latestPublicationActivity;
    const publicationDate = publication.publicationDate;
    const saves = [];

    if (!publicationActivity) {
      // Publication registration without a request
      publicationActivity = this.store.createRecord(
        'publication-activity',
        {
          startDate: new Date(),
          subcase: this.publicationSubcase,
        }
      );
    }
    publicationActivity.endDate = publicationDate;
    yield publicationActivity.save();

    const decision = this.store.createRecord('decision', {
      publicationDate: publicationDate,
      publicationActivity: publicationActivity,
    });
    // The decision (and the publicationActivity) must be saved
    //  before calling the publicationService.updatePublicationStatus method.
    //  otherwise that method creates duplicate Decisions and PublicationActivities
    yield decision.save();

    if (publication.mustUpdatePublicationStatus) {
      const statusUpdate = this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PUBLISHED,
        publication.publicationDate
      );
      saves.push(statusUpdate);
    }

    yield Promise.all(saves);
    this.router.refresh('publications.publication.publication-activities');
    this.closeRegistrationModal();
  }

  @action
  async editPublication(publication) {
    const decision = publication.decision;
    decision.publicationDate = publication.publicationDate;

    const publicationActivity = await decision.publicationActivity;
    publicationActivity.endDate = publication.publicationDate;

    await Promise.all([decision.save(), publicationActivity.save()]);
  }

  @task
  *deleteRequest(requestActivityArgs) {
    yield this.performDeleteRequest(requestActivityArgs);
    // separate from this.performDeleteRequest(...):
    //    refresh is OK to be aborted
    this.router.refresh('publications.publication.publication-activities');
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performDeleteRequest(requestActivity) {
    const deletes = [];

    const publicationActivity = await requestActivity.publicationActivity;
    deletes.push(publicationActivity.destroyRecord());

    const mail = await requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    deletes.push(mail?.destroyRecord());

    const pieces = await requestActivity.usedPieces;
    for (const piece of pieces.slice()) {
      const proofingActivity = await piece.proofingActivityGeneratedBy;

      // The pieces that are used in a proofingActivity should not be deleted
      // Only proof (result/generated) pieces are uploaded, so they
      //    so no check whether they are linked to a translationActivity is required
      if (!proofingActivity) {
        const pieceDelete = this.publicationService.deletePiece(piece);
        deletes.push(pieceDelete)
      }
    }

    await Promise.all(deletes);

    // delete after previous records have been destroyed
    // destroying in parallel throws occasional errors
    await requestActivity.destroyRecord();
  }

  @action
  openRequestModal() {
    this.isOpenRequestModal = true;
  }

  @action
  closeRequestModal() {
    this.isOpenRequestModal = false;
  }

  @action
  openRegistrationModal() {
    this.isOpenRegistrationModal = true;
  }

  @action
  closeRegistrationModal() {
    this.isOpenRegistrationModal = false;
  }
}
