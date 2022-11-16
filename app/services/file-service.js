import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import fetch from 'fetch';
import { DOCUMENT_DELETE_UNDO_TIME_MS } from 'frontend-kaleidos/config/config';

export default class FileService extends Service {
  @service store;
  @service toaster;
  @tracked objectsToDelete = [];

  @task
  *deleteDocumentContainerWithUndo(documentContainerToDelete) {
    this.objectsToDelete.push(documentContainerToDelete);
    documentContainerToDelete.aboutToDelete = true;
    yield timeout(DOCUMENT_DELETE_UNDO_TIME_MS);
    if (this.findObjectToDelete(documentContainerToDelete.id)) {
      yield this.deleteDocumentContainer(documentContainerToDelete);
    } else {
      documentContainerToDelete.aboutToDelete = false;
    }
  }

  // TODO KAS-3588 DELETE if not used in KAS-3587 (last version delete)
  @task
  *deletePieceWithUndo(pieceToDelete) {
    this.objectsToDelete.push(pieceToDelete);
    pieceToDelete.aboutToDelete = true;
    yield timeout(DOCUMENT_DELETE_UNDO_TIME_MS);
    if (this.findObjectToDelete(pieceToDelete.id)) {
      yield this.deletePiece(pieceToDelete);
    } else {
      pieceToDelete.aboutToDelete = false;
    }
  }

  async deleteDocumentContainer(documentContainer) {
    const documentContainerToDelete = await documentContainer;
    if (!documentContainerToDelete) {
      return;
    }
    const pieces = await documentContainerToDelete.pieces;
    await Promise.all(pieces.map(async (piece) => this.deletePiece(piece)));
    documentContainerToDelete.destroyRecord();
  }

  async deletePiece(piece) {
    const pieceToDelete = await piece;
    if (!pieceToDelete) {
      return;
    }
    const file = await pieceToDelete.file;
    await this.deleteFile(file);
    return pieceToDelete.destroyRecord();
    // TODO: delete container in case we just orphaned it
  }

  async deleteFile(file) {
    const fileToDelete = await file;
    if (!fileToDelete) {
      return;
    }
    const derivedFileToDelete = await file.derived;
    await derivedFileToDelete?.destroyRecord();
    return fileToDelete.destroyRecord();
  }

  async reverseDelete(id) {
    const foundObjectToDelete = this.findObjectToDelete(id);
    this.objectsToDelete.removeObject(foundObjectToDelete);
    const record = await this.store.findRecord(
      foundObjectToDelete.constructor.modelName,
      id
    );
    record.aboutToDelete = false;
  }

  async convertSourceFile(sourceFile) {
    const response = await fetch(`/files-conversion/${sourceFile.id}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      console.warn(`Couldn't convert file with id ${sourceFile.id}`);
      throw new Error('An exception occurred while converting a file: ' + JSON.stringify(result.errors));
    } else {
      const derivedFile = await this.store.findRecord('file', result.data[0].id)
      sourceFile.derived = derivedFile;
      await sourceFile.save();
    }
  }

  findObjectToDelete(id) {
    return this.objectsToDelete.find((object) => object.id === id);
  }
}
