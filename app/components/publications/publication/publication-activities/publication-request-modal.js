import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';

export default class PublicationsPublicationPublicationActivitiesPublicationRequestModal extends Component {
  @service store;
  @service publicationService;

  @tracked subject;
  @tracked message;
  @tracked uploadedPieces = [];
  @tracked transferredPieces = [];
  @tracked mustUpdatePublicationStatus = true;

  validators;

  constructor() {
    super(...arguments);
    this.loadProofPieces.perform();
    this.setEmailFields.perform();
    this.initValidators();
  }

  get isLoading() {
    return (
      this.loadProofPieces.isRunning ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  get isCancelDisabled() {
    return (
      this.loadProofPieces.isRunning ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  get isSaveDisabled() {
    return (
      !this.validators.areValid || this.cancel.isRunning || this.save.isRunning
    );
  }

  get pieces() {
    return [...this.transferredPieces, ...this.uploadedPieces];
  }

  @task
  *loadProofPieces() {
    let proofingActivity = this.args.proofingActivity;
    if (proofingActivity) {
      let generatedPieces = yield proofingActivity.generatedPieces;
      generatedPieces = generatedPieces.toArray();
      generatedPieces = generatedPieces.sortBy('name', 'receivedDate');
      this.transferredPieces = generatedPieces;
    } else {
      this.transferredPieces = [];
    }
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
      pieces: new Validator(() => this.pieces.length > 0),
    });
  }

  @task
  *save() {
    yield this.args.onSave({
      subject: this.subject,
      message: this.message,
      pieces: this.pieces,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @dropTask
  *cancel() {
    yield Promise.all(
      this.uploadedPieces.map((piece) =>
        this.deleteUploadedPiece.perform(piece)
      )
    );
    this.args.onCancel();
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    const [identification, numacNumbers, publicationSubcase, urgencyLevel] =
      yield Promise.all([
        publicationFlow.identification,
        publicationFlow.numacNumbers,
        publicationFlow.publicationSubcase,
        publicationFlow.urgencyLevel,
      ]);

    const mailParams = {
      identifier: identification.idName,
      isUrgent: urgencyLevel?.isUrgent,
      targetEndDate: publicationSubcase.targetEndDate,
      numacNumbers: numacNumbers,
    };

    const mailTemplate = publicationRequestEmail(mailParams);
    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.pushObject(piece);
  }

  @task
  *deleteUploadedPiece(piece) {
    yield this.publicationService.deletePiece(piece);
    this.uploadedPieces.removeObject(piece);
  }

  @action
  unlinkTransferredPiece(piece) {
    this.transferredPieces.removeObject(piece);
  }

  @action
  setPublicationRequestedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }
}
