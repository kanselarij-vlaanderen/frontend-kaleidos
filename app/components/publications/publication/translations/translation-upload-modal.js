import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { guidFor } from '@ember/object/internals';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (pieces)
   * @argument onCancel
   */
  @service store;
  @service('file-queue') fileQueueService;

  @tracked translationDocument = null;
  @tracked newPieces = [];
  @tracked name = null;
  @tracked receivedAtDate = null;


  constructor() {
    super(...arguments);
    if (this.fileQueueService.find(this.fileQueueName)) {
      this.fileQueueService.create(this.fileQueueName);
    }
  }

  get fileQueueName() {
    return `${guidFor(this)}-file-queue`;
  }

  get fileQueue() {
    return this.fileQueueService.find(this.fileQueueName);
  }

  get saveIsDisabled() {
    return this.translationDocument === null || this.receivedAtDate === null;
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    this.translationDocument = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.name = file.filenameWithoutExtension;
    this.newPieces.pushObject(this.translatedDocument);
  }

  @task
  *cancelTranslation() {
    if (this.translationDocument) {
      yield this.deleteUploadedPiece.perform(this.translationDocument);
    }
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
  *saveTranslation() {
    if (this.args.onSave) {
      yield this.args.onSave({
        piece: this.translationDocument,
        name: this.name,
        receivedAtDate: this.receivedAtDate,
        requestActivity: this.args.requestActivity,
      });
    }
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.receivedAtDate = selectedDates[0];
  }
}
