import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class UtilsAddDocument extends Component {
  /**
   *
   * @argument title: title of the upload modal
   * @argument onCancel
   * @argument onSave: receives pieceInCreation as an argument
   */
  @service store;

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
    const file = await this.pieceInCreation.file;
    await deleteFile(file);
    this.pieceInCreation.deleteRecord();
    this.pieceInCreation = null;
  }

  @action
  createNewPiece(uploadedFile) {
    const now = new Date();
    this.pieceInCreation = this.store.createRecord(
      this.args.pieceSubtype ?? 'piece',
      {
        created: now,
        modified: now,
        file: uploadedFile,
        name: uploadedFile.filenameWithoutExtension,
      }
    );
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(this.pieceInCreation);
    }
  }
}
