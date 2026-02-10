import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument {PublicationFlow} publicationFlow *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsDocumentsReferenceDocumentUploadModalComponent extends Component {
  @service publicationService;

  @tracked uploadedPieces = new TrackedArray([]);

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return this.uploadedPieces.length === 0 || this.cancel.isRunning;
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.push(piece);
  }

  cancel = task({ drop: true }, async () => {
    await Promise.all(
      this.uploadedPieces.map((piece) =>
        this.deleteUploadedPiece.perform(piece)
      )
    );
    this.args.onCancel();
  });

  deleteUploadedPiece = task(async (piece) => {
    await this.publicationService.deletePiece(piece);
    removeObject(this.uploadedPieces, piece);
  });

  save = task(async () => {
    await this.args.onSave(this.uploadedPieces);
  });

  @action
  setReceivedDate(piece, selectedDate) {
    if (selectedDate) {
      piece.receivedDate = selectedDate;
    }
  }
}
