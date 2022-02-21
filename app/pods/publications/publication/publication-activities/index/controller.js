import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, task } from 'ember-concurrency';

export class PublicationRequestEvent {
  static async create(publicationActivity) {
    return Object.assign(new PublicationRequestEvent(), {
      publicationActivity,
    });
  }

  isRequest = true;
  /** @type {PublicationActivity} */
  @tracked publicationActivity;

  get title() {
    return this.publicationActivity.title;
  }

  get date() {
    return this.publicationActivity.startDate;
  }
}

export class PublicationPublicationEvent {
  static async create(decision) {
    return Object.assign(new PublicationPublicationEvent(), {
      decision,
    });
  }

  isPublication = true;
  /** @type {DecisionModel} */
  @tracked decision;

  get title() {
    return this.decision.title;
  }

  get date() {
    return this.decision.publicationDate;
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
