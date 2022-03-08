import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';

export default class PublicationRequestModal extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked uploadedPieces = [];
  @tracked mustUpdatePublicationStatus = false;


  constructor() {
    super(...arguments);
    this.initValidators();
    this.setEmailFields.perform();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
      uploadedPieces: new Validator(() => this.uploadedPieces.length > 0),
    });
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
      subject: this.subject,
      message: this.message,
      uploadedPieces: this.uploadedPieces,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
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

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    const [identification, numacNumbers, publicationSubcase] = yield Promise.all([
      publicationFlow.identification,
      publicationFlow.numacNumbers,
      publicationFlow.publicationSubcase,
    ]);

    const mailParams = {
      identifier: identification.idName,
      targetEndDate: publicationSubcase.targetEndDate,
      numacNumbers: numacNumbers,
    };

    const mailTemplate = publicationRequestEmail(mailParams);
    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  }

  @action
  async uploadPiece(file) {
    const created = file.created;

    const documentContainer = this.store.createRecord('document-container', {
      created: created,
    });
    await documentContainer.save();
    const piece = this.store.createRecord('piece', {
      created: created,
      modified: created,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });

    this.uploadedPieces.pushObject(piece);
  }

  @action
  setPublicationRequestedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    this.uploadedPieces.removeObject(piece);
    const [file, documentContainer] = yield Promise.all([
      piece.file,
      piece.documentContainer,
    ]);

    yield Promise.all([
      file.destroyRecord(),
      documentContainer.destroyRecord(),
      piece.destroyRecord(),
    ]);
  }
}
