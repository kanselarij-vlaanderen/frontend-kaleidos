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
  @tracked translationPieces = [];
  @tracked mustUpdatePublicationStatus = false;

  validators;

  constructor() {
    super(...arguments);
    this.loadTranslationPieces.perform();
    this.setEmailFields.perform();
    this.initValidators();
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    const totalPieces =
      this.uploadedPieces.length + this.translationPieces.length;
    return (
      totalPieces === 0 ||
      !this.validators.areValid ||
      this.cancel.isRunning ||
      this.loadTranslationPieces.isRunning
    );
  }

  @task
  *save() {
    const pieces = [...this.uploadedPieces, ...this.translationPieces];
    yield this.args.onSave({
      subject: this.subject,
      message: this.message,
      uploadedPieces: pieces,
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
  *loadTranslationPieces() {
    let translationActivity = this.args.translationActivity;

    if (!translationActivity) {
      const translationActivities = yield this.store.query(
        'translation-activity',
        {
          'filter[subcase][publication-flow][:id:]':
            this.args.publicationFlow.id,
          include: 'generated-pieces,used-pieces',
          sort: '-start-date',
        }
      );
      translationActivity = translationActivities.find(
        (activity) => activity.isFinished
      );
    }

    if (translationActivity) {
      const [usedPieces, generatedPieces] = yield Promise.all([
        translationActivity.usedPieces,
        translationActivity.generatedPieces,
      ]);
      this.translationPieces = [
        ...usedPieces.toArray(),
        ...generatedPieces.toArray(),
      ];
    } else {
      this.translationPieces = [];
    }
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
  unlinkTranslationPiece(piece) {
    this.translationPieces.removeObject(piece);
  }

  @action
  setProofRequestedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
