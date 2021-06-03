import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { guidFor } from '@ember/object/internals';

export default class PublicationsPublicationDocumentsDocumentsUploadModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (pieces)
   * @argument onCancel
   */
  @service store;
  @service('file-queue') fileQueueService;

  @tracked isExpanded = false;
  @tracked newPieces = [];

  constructor() {
    super(...arguments);
    if (this.fileQueueService.find(this.fileQueueName)) {
      this.fileQueueService.create(this.fileQueueName);
    }
  }

  @action
  toggleSize() {
    this.isExpanded = !this.isExpanded;
  }

  get fileQueueName() {
    return `${guidFor(this)}-file-queue`;
  }

  get fileQueue() {
    return this.fileQueueService.find(this.fileQueueName);
  }

  get saveIsDisabled() {
    return this.newPieces.length === 0 // waiting for a file to be uploaded
    || this.fileQueue.files.length // still files in queue -> uploading
    || this.savePieces.isRunning; // after pressing the save-button
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *cancelUploadPieces() {
    const deleteTasks = this.newPieces.map((piece) => this.deleteUploadedPiece.perform(piece));
    yield all(deleteTasks);
    this.args.onCancel();
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @task
  *savePieces() {
    if (this.args.onSave) {
      yield this.args.onSave(this.newPieces);
    }
  }
}
