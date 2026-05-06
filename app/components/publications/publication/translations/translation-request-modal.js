import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { translationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { Validator, ValidatorSet } from 'frontend-kaleidos/utils/validators';
import { isPresent } from '@ember/utils';
import { EMAIL_ATTACHMENT_MAX_SIZE } from 'frontend-kaleidos/config/config';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument dueDate
   * @argument publicationFlow
   * @argument onSave
   * @argument onCancel
   */
  @service publicationService;

  @tracked uploadedPieces = new TrackedArray([]);
  @tracked numberOfPages;
  @tracked numberOfWords;
  @tracked translationDueDate = this.args.dueDate;
  @tracked subject;
  @tracked message;
  @tracked mustUpdatePublicationStatus = true;

  validators;

  constructor() {
    super(...arguments);
    this.initValidators();
    this.setEmailFields.perform();
  }

  get sumOfUploadedPiecesIsTooLarge() {
    const sizeSum = this.uploadedPieces
                        .map((piece) => piece.get('file.size'))
                        .reduce((total, size) => total + size, 0);
    return sizeSum > EMAIL_ATTACHMENT_MAX_SIZE;
  }


  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      this.sumOfUploadedPiecesIsTooLarge ||
      !this.validators.areValid ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  save = task(async () => {
    await this.args.onSave({
      pieces: this.uploadedPieces,
      translationDueDate: this.translationDueDate,
      subject: this.subject,
      message: this.message,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  });

  cancel = task({ drop: true }, async () => {
    await Promise.all(
      this.uploadedPieces.map((piece) =>
        this.deleteUploadedPiece.perform(piece)
      )
    );
    this.args.onCancel();
  });

  setEmailFields = task(async () => {
    const publicationFlow = this.args.publicationFlow;
    const identification = await publicationFlow.identification;
    const contactPersons = await publicationFlow.contactPersons;
    const urgencyLevel = await publicationFlow.urgencyLevel;
    const mailParams = {
      identifier: identification.idName,
      shortTitle: publicationFlow.shortTitle,
      title: publicationFlow.longTitle || publicationFlow.shortTitle,
      isUrgent: urgencyLevel?.isUrgent,
      dueDate: this.translationDueDate,
      numberOfPages: this.numberOfPages,
      numberOfWords: this.numberOfWords,
      numberOfDocuments: this.uploadedPieces.length,
      contactPersons: contactPersons.slice(),
    };

    const mailTemplate = await translationRequestEmail(mailParams);
    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  });

  @action
  setTranslationDueDate(selectedDate) {
    this.translationDueDate = selectedDate;
    this.setEmailFields.perform();
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.push(piece);
    this.setEmailFields.perform();
  }

  @action
  setTranslationRequestedStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }

  deleteUploadedPiece = task(async (piece) => {
    await this.publicationService.deletePiece(piece);
    removeObject(this.uploadedPieces, piece);
    this.setEmailFields.perform();
  });

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
