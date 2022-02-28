import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/* eslint-disable no-unused-vars */
import PublicationService from 'frontend-kaleidos/services/publication-service';

import Piece from 'frontend-kaleidos/models/piece';
import PublicationFlow from 'frontend-kaleidos/models/publication-flow';
import PublicationSubcase from 'frontend-kaleidos/models/publication-subcase';
import RequestActivity from 'frontend-kaleidos/models/request-activity';
import PublicationActivity from 'frontend-kaleidos/models/publication-activity';
/* eslint-enable no-unused-vars */

// TODO
// For now, we limit the number of request- and publication-activities to 1
// We will need to figure out whether multiple publication-activities are possible
export class PublicationRequestEvent {
  constructor(requestActivity) {
    this.requestActivity = requestActivity;
  }

  // first: sort on a requestActivity's and publicationActivity's startDate:
  //  => show linked request ane publicationActivities together
  // next: sort on timeOrder:
  //  => show the publicationActivity after the requestActivity in the timeline
  timeOrder = 0;
  isRequest = true;
  isShown = true;
  /** @type {RequestActivity} */
  @tracked requestActivity;

  get date() {
    return this.requestActivity.startDate;
  }
}

export class PublicationPublicationEvent {
  constructor(publicationActivity) {
    this.publicationActivity = publicationActivity;
  }

  timeOrder = 1;
  isPublication = true;
  /** @type {PublicationActivity} */
  @tracked publicationActivity;

  get isShown() {
    return this.publicationActivity.endDate !== undefined;
  }

  get date() {
    return this.publicationActivity.startDate;
  }
}

export default class PublicationsPublicationPublicationActivitiesIndexController extends Controller {
  /** @type {(PublicationRequestEvent|PublicationPublicationEvent)[]} */
  model;

  @service store;
  /** @type {PublicationService} */
  @service publicationService;

  /** @type {PublicationFlow} */
  @tracked publicationFlow;
  /** @type {PublicationSubcase} */
  publicationSubcase;
  // The model of the PublicationRegistrationModal
  /** @type {{publicationDate: Date}} */
  @tracked publication;
  selectedPublicationActivity;

  @tracked isOpenRequestModal = false;
  @tracked isOpenRegistrationModal = false;

  get isRequestDisabled() {
    return this.requestActivities.length > 0;
  }

  get isRegistrationDisabled() {
    return this.publicationActivities.some((it) => it.endDate);
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
    this.publication = undefined;
    this.isOpenRegistrationModal = true;
  }

  @action
  closeRegistrationModal() {
    this.isOpenRegistrationModal = false;
  }

  @action
  async openPublicationModalEdit(publicationActivity) {
    this.selectedPublicationActivity = publicationActivity;
    const decisions = await publicationActivity.decisions;
    // Data model differs from user interface: only 1 decision can be added (for publication-date) .firstObject === .onlyObject
    const decision = decisions.firstObject;
    this.publication = {
      publicationDate: decision.publicationDate,
    };
    this.isOpenRegistrationModal = true;
  }

  @action
  closePublicationModalEdit() {
    this.isOpenRegistrationModal = false;
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
  async saveRegistration(args) {
    if (this.publication) {
      const publicationActivity = this.selectedPublicationActivity;
      await this.performUpdatePublication(publicationActivity, args);
    } else {
      await this.performSaveRegistration(args);
    }

    this.send('refresh');
    this.isOpenRegistrationModal = false;
  }

  /**
   * @param {{
   *  publicationDate: Date,
   *  mustUpdatePublicationStatus: boolean,
   * }} args
   */
  async performSaveRegistration(args) {
    const saves = [];

    const publicationActivity = this.publicationActivities.lastObject;

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

      this.publicationSubcase.endDate = args.receivedAtDate;
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
  async performUpdatePublication(publicationActivity, args) {
    const decisions = await publicationActivity.decisions;
    const decision = decisions.firstObject;
    decision.publicationDate = args.publicationDate;
    await decision.save();
  }

  @task
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const publicationActivity = yield requestActivity.publicationActivity;
    deletePromises.push(publicationActivity.destroyRecord());

    const mail = yield requestActivity.email;
    if (mail) {
      deletePromises.push(mail.destroyRecord());
    }

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

    // delete after previous records have been destroyed
    // destroying in parallel throws occasional errors
    yield requestActivity.destroyRecord();

    this.send('refresh');
  }
}
