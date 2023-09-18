import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { inject as service } from '@ember/service';
import { EMAIL_ATTACHMENT_MAX_SIZE } from 'frontend-kaleidos/config/config';

/**
 * @argument {PublicationFlow} publicationFlow includes: identification
 * @argument translationActivity Translation activity the proof is requested for (optional)
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
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
    this.loadTranslationPieces.perform();
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
      this.loadTranslationPieces.isRunning ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  get isCancelDisabled() {
    return (
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
  *loadTranslationPieces() {
    let translationActivity = this.args.translationActivity;

    if (!translationActivity) {
      // Fetch latest finished translation-activity
      translationActivity = yield this.store.queryOne('translation-activity', {
        'filter[subcase][publication-flow][:id:]': this.args.publicationFlow.id,
        // Filter on end-date is a workaround to ensure end date exists
        'filter[:gte:end-date]': '1302-07-11',
        // eslint-disable-next-line prettier/prettier
        include: [
          'generated-pieces',
          'generated-pieces.file',
          'used-pieces',
          'used-pieces.file',
        ].join(','),
        sort: '-start-date',
      });
    }

    if (translationActivity) {
      const [usedPieces, generatedPieces] = yield Promise.all([
        translationActivity.usedPieces,
        translationActivity.generatedPieces,
      ]);
      this.transferredPieces = [
        ...usedPieces.toArray(),
        ...generatedPieces.toArray(),
      ].sortBy('name', 'created');
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
    const identification = yield publicationFlow.identification;
    const urgencyLevel = yield publicationFlow.urgencyLevel;
    const threadId = yield publicationFlow.threadId;
    const mailParams = {
      identifier: identification.idName,
      shortTitle: publicationFlow.shortTitle,
      isUrgent: urgencyLevel?.isUrgent,
      longTitle: publicationFlow.longTitle
        ? publicationFlow.longTitle
        : publicationFlow.shortTitle,
      threadId: threadId?.idName,
    };

    const mailTemplate = proofRequestEmail(mailParams);

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
  setProofRequestedStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }
}
