import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { EMAIL_ATTACHMENT_MAX_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationPublicationActivitiesPublicationRequestModal extends Component {
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

  get sumOfUploadedPiecesIsTooLarge() {
    const sizeSum = this.uploadedPieces
                        .map((piece) => piece.get('file.size'))
                        .reduce((total, size) => total + size, 0);
    return sizeSum > EMAIL_ATTACHMENT_MAX_SIZE;
  }

  get isLoading() {
    return (
      this.loadProofPieces.isRunning ||
      this.setEmailFields.isRunning ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  get isCancelDisabled() {
    return (
      this.loadProofPieces.isRunning ||
      this.setEmailFields.isRunning ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  get isSaveDisabled() {
    return (
      !this.validators.areValid ||
      this.sumOfUploadedPiecesIsTooLarge ||
      this.cancel.isRunning ||
      this.save.isRunning
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
      generatedPieces = generatedPieces
        .slice()
        .sort(
          (p1, p2) =>
            p1.name.localeCompare(p2.name) || p1.receivedDate - p2.receivedDate
        );
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
    const threadId = yield publicationFlow.threadId;
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
      threadId: threadId?.idName,
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
  setPublicationRequestedStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }
}
