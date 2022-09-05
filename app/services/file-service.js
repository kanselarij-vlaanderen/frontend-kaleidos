import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { DOCUMENT_DELETE_UNDO_TIME_MS } from 'frontend-kaleidos/config/config';

export default class FileService extends Service {
  @service store;
  @service toaster;
  @tracked objectsToDelete = [];

  @task
  *deleteDocumentContainerWithUndo(documentContainerToDelete) {
    this.objectsToDelete.push(documentContainerToDelete);
    documentContainerToDelete.set('aboutToDelete', true);
    yield timeout(DOCUMENT_DELETE_UNDO_TIME_MS);
    if (this.findObjectToDelete(documentContainerToDelete.get('id'))) {
      yield this.deleteDocumentContainer(documentContainerToDelete);
    } else {
      documentContainerToDelete.set('aboutToDelete', false);
    }
  }

  // TODO KAS-3588 DELETE if not used in KAS-3587 (last version delete)
  @task
  *deletePieceWithUndo(pieceToDelete) {
    this.objectsToDelete.push(pieceToDelete);
    pieceToDelete.set('aboutToDelete', true);
    yield timeout(DOCUMENT_DELETE_UNDO_TIME_MS);
    if (this.findObjectToDelete(pieceToDelete.get('id'))) {
      yield this.deletePiece(pieceToDelete);
    } else {
      pieceToDelete.set('aboutToDelete', false);
    }
  }

  async deleteDocumentContainer(documentContainer) {
    const documentContainerToDelete = await documentContainer;
    if (!documentContainerToDelete) {
      return;
    }
    const pieces = await documentContainerToDelete.get('pieces');
    await Promise.all(pieces.map(async (piece) => this.deletePiece(piece)));
    documentContainerToDelete.destroyRecord();
  }

  async deletePiece(piece) {
    const pieceToDelete = await piece;
    if (!pieceToDelete) {
      return;
    }
    const file = pieceToDelete.get('file');
    await this.deleteFile(file);
    return pieceToDelete.destroyRecord();
    // TODO: delete container in case we just orphaned it
  }

  async deleteFile(file) {
    const fileToDelete = await file;
    if (!fileToDelete) {
      return;
    }
    return fileToDelete.destroyRecord();
  }

  async reverseDelete(id) {
    const foundObjectToDelete = this.findObjectToDelete(id);
    this.objectsToDelete.removeObject(foundObjectToDelete);
    const record = await this.store.findRecord(
      foundObjectToDelete.get('constructor.modelName'),
      id
    );
    record.set('aboutToDelete', false);
  }

  findObjectToDelete(id) {
    return this.objectsToDelete.find((object) => object.get('id') === id);
  }
}
