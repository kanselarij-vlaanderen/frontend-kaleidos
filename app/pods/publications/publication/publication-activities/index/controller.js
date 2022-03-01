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

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked selectedPublicationDetails;
  selectedPublicationActivity;

  @tracked isOpenRequestModal = false;
  @tracked isOpenPublicationDetailsModal = false;

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
    return !this.latestPublicationActivity || this.latestPublicationActivity.isFinished;
  }

  // REQUEST PUBLICATION
  @action
  openRequestModal() {
    this.isOpenRequestModal = true;
  }

  @task
  *saveRequest(args) {
    yield this.publicationService.requestPublication({
      publicationFlow: this.publicationFlow,
      subject: args.subject,
      message: args.message,
      uploads: args.uploads,
      isProof: false,
    });

    this.send('refresh');
    this.isOpenRequestModal = false;
  }

  @action
  closeRequestModal() {
    this.isOpenRequestModal = false;
  }

  // REGISTER + EDIT PUBLICATION
  @action
  openPublicationRegisterModal() {
    this.selectedPublicationActivity = undefined;
    this.selectedPublicationDetails = undefined;
    this.isOpenPublicationDetailsModal = true;
  }

  @action
  async openPublicationEditModal(publicationActivity) {
    this.selectedPublicationActivity = publicationActivity;
    this.selectedPublicationDetails = await this.buildPublicationDetails(
      publicationActivity
    );
    this.isOpenPublicationDetailsModal = true;
  }

  async buildPublicationDetails(publicationActivity) {
    const decisions = await publicationActivity.decisions;
    // Data model differs from user interface: only 1 decision can be added (for publication-date)
    //  .firstObject === .onlyObject
    const decision = decisions.firstObject;
    const publicationDetails = {
      publicationDate: decision.publicationDate,
    };
    return publicationDetails;
  }

  @action
  closePublicationDetailsModal() {
    this.isOpenPublicationDetailsModal = false;
  }

  @action
  async savePublication(args) {
    const isEditing = this.selectedPublicationDetails !== undefined;
    if (isEditing) {
      const publicationActivity = this.selectedPublicationActivity;
      await this.performEditPublication(publicationActivity, args);
    } else {
      await this.performRegisterPublication(args);
    }

    this.send('refresh');
    this.isOpenPublicationDetailsModal = false;
  }

  /**
   * @param {{
   *  publicationDate: Date,
   *  mustUpdatePublicationStatus: boolean,
   * }} args
   */
  async performRegisterPublication(args) {
    const saves = [];

    const publicationActivity = this.latestPublicationActivity;

    // TODO?: should publicationActivty be created when none exists?
    //  like when updating the publication status?

    const decision = this.store.createRecord('decision', {
      publicationDate: args.publicationDate,
      publicationActivity: publicationActivity,
    });
    saves.push(decision.save());

    publicationActivity.endDate = args.publicationDate;
    saves.push(publicationActivity.save());

    // publicationSubcase.receivedDate will probably not be updated
    // this property is already set to an earlier when uploading the proof
    if (
      !this.publicationSubcase.receivedDate ||
      args.publicationDate < this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = args.publicationDate;
    }

    if (args.mustUpdatePublicationStatus) {
      const statusSave = this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PUBLISHED,
        args.publicationDate
      );
      saves.push(statusSave);

      this.publicationSubcase.endDate = args.publicationDate;
    }

    // (this is a deceptive property:
    // setting a field to undefined does not make the model to be marked as dirty
    // the date is required in the modal, so this issue does not occur)
    if (this.publicationSubcase.hadDirtyAttributes) {
      saves.push(this.publicationSubcase.save());
    }

    await Promise.all(saves);
  }

  @action
  async performEditPublication(publicationActivity, args) {
    // TODO check whether other dates have to be updated
    const decisions = await publicationActivity.decisions;
    const decision = decisions.firstObject;
    decision.publicationDate = args.publicationDate;
    await decision.save();
  }

  @action
  async deleteRequest(requestActivity) {
    const deletes = [];

    const publicationActivity = await requestActivity.publicationActivity;
    deletes.push(publicationActivity.destroyRecord());

    const mail = await requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    if (mail) {
      deletes.push(mail.destroyRecord());
    }

    let pieces = await requestActivity.usedPieces;
    pieces = pieces.toArray();
    for (const piece of pieces) {
      const file = await piece.file;
      const documentContainer = await piece.documentContainer;

      // TODO: when pieces will be added from Drukproeven
      // it will be necessary to check the pieces are not linked
      // to something else and may be deleted
      deletes.push(piece.destroyRecord());
      deletes.push(file.destroyRecord());
      deletes.push(documentContainer.destroyRecord());
    }

    await Promise.all(deletes);

    // delete after previous records have been destroyed
    // destroying in parallel throws occasional errors
    await requestActivity.destroyRecord();

    this.send('refresh');
  }
}
