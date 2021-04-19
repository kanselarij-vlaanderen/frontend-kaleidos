import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { A } from '@ember/array';
import moment from 'moment';

export default class PublicationsPublicationDocumentsDocumentsUploadModalComponent extends Component {
  @inject store;

  @tracked isExpanded = false;
  @tracked isSaving = false;
  @tracked newPieces = [];

  @task
  *loadDocumentTypes() {
    if (!this.documentTypes.length) {
      this.documentTypes = yield this.store.query('document-type', {
        page: {
          size: 50,
        },
      });
    }
  }

  @action
  toggleSize() {
    this.isExpanded = !this.isExpanded;
  }

  @action
  uploadPiece(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *cancelUploadPieces() {
    const deleteTasks = this.newPieces.map((piece) => this.deleteUploadedPiece.perform(piece));
    yield all(deleteTasks);
    this.args.onCancel();
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  cancelDeleteExistingPiece() {
    this.pieceToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  async savePieces() {
    await this.savePiecesTask.perform(this.newPieces);
    this.args.onSave(this.newPieces);
    this.newPieces = A([]);
  }

  @task
  *savePiecesTask(newPieces) {
    const savePromises = newPieces.map(async(piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deleteUploadedPiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    yield piece.save();
  }
}
