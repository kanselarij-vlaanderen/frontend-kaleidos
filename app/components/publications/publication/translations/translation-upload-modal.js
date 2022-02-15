import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  @service('file-queue') fileQueueService;

  @tracked generatedPieces = [];
  @tracked receivedAtDate = new Date();
  @tracked isTranslationIn = false;
  validators;

  constructor() {
    super(...arguments);
    if (this.fileQueue) {
      this.fileQueueService.create(this.fileQueueName);
    }
    this.initValidators();
  }

  get fileQueueName() {
    return `${guidFor(this)}-file-queue`;
  }

  get fileQueue() {
    return this.fileQueueService.find(this.fileQueueName);
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return this.generatedPieces.length === 0 || !this.validators.areValid;
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
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
console.log(piece)

    this.generatedPieces.push(piece);
console.log(this.generatedPieces)

  }

  @task({
    drop: true,
  })
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }

    if (this.generatedPieces.length > 0) {
      for (let piece of this.generatedPieces) {
        yield this.deleteUploadedPiece.perform(piece);
      }
    }
    this.args.onCancel();
  }

  @task
  *save() {
    yield this.args.onSave({
      generatedPieces: this.generatedPieces,
      receivedAtDate: this.receivedAtDate,
      isTranslationIn: this.isTranslationIn,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.validators.receivedAtDate.enableError();
    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else { // this case occurs when users manually empty the date input-field
      this.receivedAtDate = undefined;
    }
  }

  @action
  setTranslationInStatus(event) {
    this.isTranslationIn = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      receivedAtDate: new Validator(() => isPresent(this.receivedAtDate)),
    });
  }
}
