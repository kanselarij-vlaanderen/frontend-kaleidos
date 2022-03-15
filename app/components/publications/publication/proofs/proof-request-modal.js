import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { inject as service } from '@ember/service';

/**
 * @argument {PublicationFlow} publicationFlow includes: identification
 * @argument translationActivity Translation activity the proof is requested for (optional)
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked uploadedPieces = [];
  @tracked transferredPieces = [];
  @tracked mustUpdatePublicationStatus = false;

  validators;

  constructor() {
    super(...arguments);
    this.loadTranslationPieces.perform();
    this.setEmailFields.perform();
    this.initValidators();
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
      this.loadTranslationPieces.isRunning ||
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
    const identification = yield publicationFlow.identification;

    const mailParams = {
      identifier: identification.idName,
      shortTitle: publicationFlow.shortTitle,
      longTitle: publicationFlow.longTitle
        ? publicationFlow.longTitle
        : publicationFlow.shortTitle,
    };

    const mailTemplate = proofRequestEmail(mailParams);

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

  @action
  unlinkTransferredPiece(piece) {
    this.transferredPieces.removeObject(piece);
  }

  @action
  setProofRequestedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }
}
