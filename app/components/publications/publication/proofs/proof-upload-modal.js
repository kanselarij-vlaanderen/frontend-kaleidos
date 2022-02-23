import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

/**
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofUploadModalComponent extends Component {
  @service store;

  @tracked uploadedPieces = [];
  @tracked receivedDate = new Date();
  @tracked mustUpdatePublicationStatus = false;
  @tracked proofPrintCorrector;

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      isEmpty(this.receivedDate) ||
      this.cancel.isRunning
    );
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
  *save() {
    yield this.args.onSave({
      proofPrintCorrector: this.proofPrintCorrector,
      receivedDate: this.receivedDate,
      uploadedPieces: this.uploadedPieces,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @action
  setreceivedDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.receivedDate = undefined;
    }
  }

  @action
  setReceivedProofStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    const documentContainer = yield piece.documentContainer;
    this.uploadedPieces.removeObject(piece);

    yield Promise.all([
      file.destroyRecord(),
      documentContainer.destroyRecord(),
      piece.destroyRecord(),
    ]);
  }
}
