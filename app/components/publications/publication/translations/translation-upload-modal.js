import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  @service store;

  @tracked generatedPieces = [];
  @tracked receivedAtDate = new Date();
  @tracked isTranslationIn = false;

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.generatedPieces.length === 0 ||
      isEmpty(this.receivedAtDate) ||
      this.cancel.isRunning
    );
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });

    this.generatedPieces.pushObject(piece);
  }

  @task({
    drop: true,
  })
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }

    if (this.generatedPieces.length > 0) {
      for (let piece of this.generatedPieces) {
        yield this.deleteUploadedPiece.perform(piece);
      }
    }
    this.args.onCancel();
  }

  @task
  *save() {
    yield this.args.onSave({
      generatedPieces: this.generatedPieces,
      receivedAtDate: this.receivedAtDate,
      isTranslationIn: this.isTranslationIn,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.receivedAtDate = undefined;
    }
  }

  @action
  setTranslationInStatus(event) {
    this.isTranslationIn = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }
}
