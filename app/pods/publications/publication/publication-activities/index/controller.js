import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/* eslint-disable no-unused-vars */
import PublicationService from 'frontend-kaleidos/services/publication-service';

import Piece from 'frontend-kaleidos/models/piece';
import PublicationSubcase from 'frontend-kaleidos/models/publication-subcase';
import RequestActivity from 'frontend-kaleidos/models/request-activity';
import PublicationActivity from 'frontend-kaleidos/models/publication-activity';
/* eslint-enable no-unused-vars */

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
  get isShown() {
    return this.publicationActivity.endDate;
  }
  /** @type {PublicationActivity} */
  @tracked publicationActivity;

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
  @tracked isOpenRequestModal = false;
  @tracked isOpenRegistrationModal = false;

  get isTranslationUploadDisabled() {
    return this.latestTranslationActivity == undefined;
  }

  get latestPublicationActivity() {
    // model is sorted: first event === latest event
    const latest = this.model.find((event) => event.isPublication);
    return latest?.publicationActivity;
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

  @action async saveRegistration(args) {
    await this.performSaveRegistration(args);

    this.send('refresh');
    this.isOpenRegistrationModal = false;
  }

  /**
   * @param {{
   *  title: string,
   *  publicationDate: Date,
   *  mustUpdatePublicationStatus: boolean,
   * }} args
   */
  async performSaveRegistration(args) {
    const saves = [];

    const publicationActivity = this.latestPublicationActivity;
    // TODO?: should publicationActivty be created when none exists?
    //  like when updating the publication status?

    const decision = this.store.createRecord('decision', {
      title: args.title,
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

  @task
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const publicationActivity = yield requestActivity.publicationActivity;
    deletePromises.push(publicationActivity.destroyRecord());

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
}
