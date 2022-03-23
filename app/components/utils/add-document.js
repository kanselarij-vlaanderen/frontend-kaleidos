import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class UtilsAddDocument extends Component {
  /**
   *
   * @argument title: title of the upload modal
   * @argument onCancel
   * @argument onSave: receives pieceInCreation as an argument
   */
  @service store;
  @service fileService;
  @service currentSession;

  @tracked pieceInCreation = null;

  @action
  cancel() {
    if (this.pieceInCreation) {
      this.deletePieceInCreation();
    }
    if (this.args.onCancel) {
      this.args.onCancel();
    }
  }

  @action
  async deletePieceInCreation() {
    const files = await this.pieceInCreation.files.toArray();
    for (let file of files) {
      await file.destroyRecord();
    }
    await this.pieceInCreation.destroyRecord();
    this.pieceInCreation = null;
  }

  @action
  createNewPiece(uploadedFile) {
    const now = new Date();
    this.pieceInCreation = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: uploadedFile,
      name: uploadedFile.filenameWithoutExtension,
    });
    this.pieceInCreation.save();
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(this.pieceInCreation);
    }
  }
}
