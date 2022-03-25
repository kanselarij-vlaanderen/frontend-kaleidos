import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  @service store;
  @service publicationService;

  @tracked uploadedPieces = [];
  @tracked receivedDate = new Date();
  @tracked mustUpdatePublicationStatus = true;

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
  *save() {
    yield this.args.onSave({
      pieces: this.uploadedPieces,
      receivedDate: this.receivedDate,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.receivedDate = undefined;
    }
  }

  @action
  setTranslationReceivedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    yield this.publicationService.deletePiece(piece);
    this.uploadedPieces.removeObject(piece);
  }
}
