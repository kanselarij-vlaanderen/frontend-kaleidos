import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewDetailsDetailsTabComponent extends Component {
  @tracked isEditingDetails = false;
  @tracked documentType;
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
  }

  get isProcessing() {
    return this.saveEditDetails.isRunning || this.cancelEditDetails.isRunning;
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  @task
  *cancelEditDetails() {
    this.args.piece.rollbackAttributes();
    yield this.loadDetailsData.perform();
    this.isEditingDetails = false;
  }

  @task
  *saveEditDetails() {
    this.args.piece.accessLevel = this.accessLevel;
    yield this.args.piece.save();
    this.args.documentContainer.type = this.documentType;
    yield this.args.documentContainer.save();

    yield this.loadDetailsData.perform();
    this.isEditingDetails = false;
  }

  @action
  openEditDetails() {
    this.isEditingDetails = true;
  }

  @action
  setAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  changeDocumentType(docType) {
    this.documentType = docType;
  }
}
