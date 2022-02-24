import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency-decorators';
import { translationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { Validator, ValidatorSet } from 'frontend-kaleidos/utils/validators';
import { isPresent } from '@ember/utils';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument dueDate
   * @argument publicationFlow
   * @argument onSave
   * @argument onCancel
   */
  @service store;

  @tracked uploadedPieces = [];
  @tracked numberOfPages;
  @tracked numberOfWords;
  @tracked translationDueDate = this.args.dueDate
    ? this.args.dueDate
    : new Date();
  @tracked subject;
  @tracked message;
  validators;

  constructor() {
    super(...arguments);
    this.initValidators();
    this.setEmailFields.perform();
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      !this.validators.areValid ||
      this.cancel.isRunning
    );
  }

  @task
  *save() {
    yield this.args.onSave({
      uploadedPieces: this.uploadedPieces,
      translationDueDate: this.translationDueDate,
      subject: this.subject,
      message: this.message,
    });
  }

  @dropTask
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }
    yield Promise.all(this.uploadedPieces.map((piece) => this.deleteUploadedPiece.perform(piece)));
    this.args.onCancel();
  }

  @dropTask
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    const documentContainer = yield piece.documentContainer;
    yield Promise.all([
      file.destroyRecord(),
      documentContainer.destroyRecord(),
    ]);
    this.uploadedPieces.removeObject(piece);
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    const identification = yield publicationFlow.identification;

    const mailParams = {
      identifier: identification.idName,
      title: publicationFlow.shortTitle,
      dueDate: this.translationDueDate,
      numberOfPages: this.numberOfPages,
      numberOfWords: this.numberOfWords,
      totalDocuments: this.uploadedPieces.length,
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
  async uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });

    this.uploadedPieces.pushObject(piece);
    this.setEmailFields.perform();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      translationDueDate: new Validator(() =>
        isPresent(this.translationDueDate)
      ),
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
