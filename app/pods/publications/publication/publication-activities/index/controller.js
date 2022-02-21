import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, task } from 'ember-concurrency';

/* eslint-disable no-unused-vars */
import RequestActivity from '../../../../../models/request-activity';
import PublicationActivity from '../../../../../models/publication-activity';
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

  get date() {
    return this.publicationActivity.startDate;
  }
}

export default class PublicationsPublicationPublicationActivitiesIndexController extends Controller {
  @service store;
  @service publicationService;
  @service fileService;

  @tracked publicationFlow;
  @tracked isOpenRequestModal = false;

  @action
  openRequestModal() {
    this.isOpenRequestModal = true;
  }

  @action
  closeRequestModal() {
    this.isOpenRequestModal = false;
  }

  @task
  *saveRequest(params) {
    yield this.publicationService.requestPublication({
      publicationFlow: this.publicationFlow,
      subject: params.subject,
      message: params.message,
      files: params.files,
      isProof: false,
    });

    this.send('refresh');
    this.isOpenRequestModal = false;
  }

  @dropTask
  *deletePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield this.fileService.deleteDocumentContainer(documentContainer);
    this.send('refresh');
  }
}
