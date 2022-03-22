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
  @tracked mustUpdatePublicationStatus = false;

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
    if (!proofingActivity) {
      // Fetch latest finished proofing-activity
      proofingActivity = yield this.store.queryOne('proofing-activity', {
        'filter[subcase][publication-flow][:id:]': this.args.publicationFlow.id,
        // Filter on end-date is a workaround to ensure end date exists
        'filter[:gte:end-date]': '1302-07-11',
        // eslint-disable-next-line prettier/prettier
        include: [
          'generated-pieces',
          'generated-pieces.files',
        ].join(','),
        sort: '-start-date',
      });
    }

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
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }
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
    const [identification, numacNumbers, publicationSubcase] =
      yield Promise.all([
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
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.pushObject(piece);
  }

  @task
  *deleteUploadedPiece(piece) {
    this.uploadedPieces.removeObject(piece);
    yield this.publicationService.deletePiece(piece);
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
