import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  @service publicationService;

  @tracked uploadedPieces = new TrackedArray([]);
  @tracked receivedDate = new Date();
  @tracked mustUpdatePublicationStatus = true;

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

  cancel = task({ drop: true }, async () => {
    await Promise.all(
      this.uploadedPieces.map((piece) =>
        this.deleteUploadedPiece.perform(piece)
      )
    );
    this.args.onCancel();
  });

  save = task(async () => {
    await this.args.onSave({
      pieces: this.uploadedPieces,
      receivedDate: this.receivedDate,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  });

  @action
  setTranslationReceivedStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }

  deleteUploadedPiece = task(async (piece) => {
    await this.publicationService.deletePiece(piece);
    removeObject(this.uploadedPieces, piece);
  });
}
