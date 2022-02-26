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
 * @argument translationPieces Used and generated pieces from a TranslationActivity if a proof is requested from a translation. These pieces cannot be deleted, but only be unlinked
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked uploadedPieces = [];
  @tracked translationPieces = [];

  validators;

  constructor() {
    super(...arguments);
    this.translationPieces = this.args.translationPieces || [];
    this.initValidators();
    this.setEmailFields.perform();
    if (this.piecesOfTranslation.length === 0) {
      this.checkIfPiecesOfTranslation.perform();
    }
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    const totalPieces = this.uploadedPieces.length + this.translationPieces.length;
    return (
      totalPieces === 0 ||
      !this.validators.areValid ||
      this.cancel.isRunning ||
      this.checkIfPiecesOfTranslation.isRunning
    );
  }

  @task
  *save() {
    const pieces = [...this.uploadedPieces, ...this.translationPieces];
    yield this.args.onSave({
      subject: this.subject,
      message: this.message,
      uploadedPieces: pieces,
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
  *checkIfPiecesOfTranslation() {
    const translationSubcase = yield this.args.publicationFlow
      .translationSubcase;
    const translationActivities = yield this.store.query(
      'translation-activity',
      {
        'filter[subcase][:id:]': translationSubcase.id,
        include: 'generated-pieces,used-pieces',
        sort: '-start-date',
      }
    );

    const finishedTranslationActivity = translationActivities.find(
      (translation) => translation.isFinished
    );
    if (finishedTranslationActivity) {
      this.piecesOfTranslation = [
        ...finishedTranslationActivity.usedPieces.toArray(),
        ...finishedTranslationActivity.generatedPieces.toArray(),
      ];
    }
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
  }

  @action
  unlinkTranslationPiece(piece) {
    this.translationPieces.removeObject(piece);
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
