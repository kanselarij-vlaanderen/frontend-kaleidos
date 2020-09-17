import Service, { inject as service } from '@ember/service';

import {
  task, timeout
} from 'ember-concurrency';
import { ajax } from 'fe-redpencil/utils/ajax';

export default Service.extend({
  toaster: service(),
  store: service(),
  shouldUndoChanges: false,

  init() {
    this._super(...arguments);
    this.set('objectsToDelete', []);
  },

  convertPiece(piece) {
    try {
      ajax({
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        url: `/pieces/${piece.get('id')}/convert`,
      })
        .then((result) => result)
        .catch((err) => err);
    } catch (exception) {
      console.warn('An exception occurred: ', exception);
      // warn(e, 'something went wrong with the conversion', { id: 'document-conversion' });
    }
  },

  deleteDocumentContainerWithUndo: task(function *(documentContainerToDelete) {
    this.objectsToDelete.push(documentContainerToDelete);
    documentContainerToDelete.set('aboutToDelete', true);
    yield timeout(15000);
    if (this.findObjectToDelete(documentContainerToDelete.get('id'))) {
      yield this.deleteDocumentContainer(documentContainerToDelete);
    } else {
      documentContainerToDelete.set('aboutToDelete', false);
    }
  }),

  deletePieceWithUndo: task(function *(pieceToDelete) {
    this.objectsToDelete.push(pieceToDelete);
    pieceToDelete.set('aboutToDelete', true);
    yield timeout(15000);
    if (this.findObjectToDelete(pieceToDelete.get('id'))) {
      yield this.deletePiece(pieceToDelete);
    } else {
      pieceToDelete.set('aboutToDelete', false);
    }
  }),

  async deleteDocumentContainer(documentContainer) {
    const documentContainerToDelete = await documentContainer;
    if (!documentContainerToDelete) {
      return;
    }
    const pieces = await documentContainerToDelete.get('pieces');
    await Promise.all(
      pieces.map(async(piece) => this.deletePiece(piece))
    );
    documentContainerToDelete.destroyRecord();
  },

  async deletePiece(piece) {
    const pieceToDelete = await piece;
    if (!pieceToDelete) {
      return;
    }
    const file = pieceToDelete.get('file');
    await this.deleteFile(file);
    return pieceToDelete.destroyRecord();
  },

  async deleteFile(file) {
    const fileToDelete = await file;
    if (!fileToDelete) {
      return;
    }
    return fileToDelete.destroyRecord();
  },

  async reverseDelete(id) {
    const foundObjectToDelete = this.findObjectToDelete(id);
    this.objectsToDelete.removeObject(foundObjectToDelete);
    const record = await this.store.findRecord(
      foundObjectToDelete.get('constructor.modelName'),
      id
    );
    record.set('aboutToDelete', false);
  },

  findObjectToDelete(id) {
    return this.objectsToDelete.find((object) => object.get('id') === id);
  },

  removeFile(id) {
    return ajax({
      method: 'DELETE',
      url: `/files/${id}`,
    });
  },
});
