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
  @tracked transferredPieces = [];
  @tracked uploadedPieces = [];

  constructor() {
    super(...arguments);

    this.initValidators();
    this.loadTransferredPieces.perform();
    this.setEmailFields.perform();
  }

  @task
  *loadTransferredPieces() {
    let proofingActivity = this.args.proofingActivty;
    if (!proofingActivity) {
      proofingActivity = yield this.loadDefaultProofingActivity();
    }

    if (proofingActivity) {
      let generatedPieces = yield proofingActivity.generatedPieces;
      generatedPieces = generatedPieces.toArray();
      this.transferredPieces = generatedPieces;
    } else {
      this.transferredPieces = [];
    }
  }

  loadDefaultProofingActivity() {
    return this.store.queryOne('proofing-activity', {
      'filter[subcase][publication-flow][:id:]': this.args.publicationFlow.id,
      // WORKAROUND: has any end date => isFinished
      'filter[:gte:end-date]': '1302-07-11',
      include: [
        'used-pieces',
        'used-pieces.file',
        'generated-pieces',
        'generated-pieces.file',
      ].join(','),
      sort: '-start-date',
    });
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
      pieces: new Validator(() => this.pieces.length > 0),
    });
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.validators.areValid || this.cancel.isRunning;
  }

  get pieces() {
    return [...this.transferredPieces, ...this.uploadedPieces];
  }

  @task
  *save() {
    yield this.args.onSave({
      subject: this.subject,
      message: this.message,
      uploadedPieces: this.pieces,
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
  unlinkTransferredPiece(piece) {
    this.transferredPieces.removeObject(piece);
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
