import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofUploadModalComponent extends Component {
  @service publicationService;

  @tracked uploadedPieces = [];
  @tracked receivedDate = new Date();
  @tracked mustUpdatePublicationStatus = true;
  @tracked proofPrintCorrector;

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      isEmpty(this.receivedDate) ||
      this.cancel.isRunning ||
      this.save.isRunning
    );
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.push(piece);
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
  *save() {
    yield this.args.onSave({
      proofPrintCorrector: this.proofPrintCorrector,
      receivedDate: this.receivedDate,
      pieces: this.uploadedPieces,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @action
  setMustUpdatePublicationStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    yield this.publicationService.deletePiece(piece);
    removeObject(this.uploadedPieces, piece);
  }
}
