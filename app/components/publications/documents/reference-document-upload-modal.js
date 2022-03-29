import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';

/**
 * @argument {PublicationFlow} publicationFlow *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsDocumentsReferenceDocumentUploadModalComponent extends Component {
  @service publicationService;

  @tracked uploadedPieces = [];

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      this.cancel.isRunning
    );
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.pushObject(piece);
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
  *deleteUploadedPiece(piece) {
    yield this.publicationService.deletePiece(piece);
    this.uploadedPieces.removeObject(piece);
  }

  @task
  *save() {
    yield this.args.onSave(this.uploadedPieces);
  }

  @action
  setReceivedDate(piece, selectedDate) {
    if (selectedDate) {
      piece.receivedDate = selectedDate;
    } else {
      // this case occurs when users manually empty the date input-field
      piece.receivedDate = undefined;
    }
  }
}
