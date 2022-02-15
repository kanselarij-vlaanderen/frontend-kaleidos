import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { translationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { guidFor } from '@ember/object/internals';
import { Validator, ValidatorSet } from 'frontend-kaleidos/utils/validators';
import { isPresent } from '@ember/utils';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument onSave
   * @argument onCancel
   */
  @service store;
  @service('file-queue') fileQueueService;

  @tracked usedPieces = [];
  @tracked pagesAmount;
  @tracked wordsAmount;
  @tracked translationDueDate = this.args.dueDate ? this.args.dueDate : new Date();
  @tracked subject;
  @tracked message;
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
    return this.cancel.isRunning || this.saveRequest.isRunning;
  }

  get isSaveDisabled() {
    return this.usedPieces.length === 0 || !this.validators.areValid || this.cancel.isRunning;
  }

  @task
  *saveRequest() {
    yield this.args.onSave({
      usedPieces: this.usedPieces,
      pagesAmount: this.pagesAmount,
      wordsAmount: this.wordsAmount,
      translationDueDate: this.translationDueDate,
      subject: this.subject,
      message: this.message,
    });
  }

  @task({
    drop: true,
  })
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.saveRequest.isRunning) {
      return;
    }

    if (this.usedPieces.length > 0) {
      for (let piece of this.usedPieces) {
        yield this.deleteUploadedPiece.perform(piece);
      }
    }
    this.args.onCancel();
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    // should resolve immediately (already fetched)
    const identification = yield publicationFlow.identification;

    const mailParams = {
      identifier: identification.idName,
      title: publicationFlow.shortTitle,
      dueDate: this.translationDueDate,
      totalPages: this.pagesAmount,
      totalWords: this.wordsAmount,
      totalDocuments: this.usedPieces.length,
    };

    const mailTemplate = translationRequestEmail(mailParams);
    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.translationDueDate = selectedDates[0];
    this.setEmailFields.perform();
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

    this.usedPieces.push(piece);

    this.setEmailFields.perform();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      translationDueDate: new Validator(() => isPresent(this.translationDueDate)),
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
