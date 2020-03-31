import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, timeout } from 'ember-concurrency';
import { ajax } from 'fe-redpencil/utils/ajax';

export default Service.extend({
  toaster: service(),
  store: service(),
  shouldUndoChanges: false,

  init() {
    this._super(...arguments);
    this.set('objectsToDelete', []);
  },

  convertDocumentVersion(documentVersion) {
    try {
      ajax({
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        url: `/document-versions/${documentVersion.get('id')}/convert`,
      })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          return err;
        });
    } catch (e) {
      warn(e, 'something went wrong with the conversion', { id: 'document-conversion' });
    }
  },

  deleteDocumentWithUndo: task(function* (documentToDelete) {
    this.objectsToDelete.push(documentToDelete);
    documentToDelete.set('aboutToDelete', true);
    yield timeout(15000);
    if (this.findObjectToDelete(documentToDelete.get('id'))) {
      yield this.deleteDocument(documentToDelete);
    } else {
      documentToDelete.set('aboutToDelete', false);
    }
  }),

  deleteDocumentVersionWithUndo: task(function* (documentVersionToDelete) {
    this.objectsToDelete.push(documentVersionToDelete);
    documentVersionToDelete.set('aboutToDelete', true);
    yield timeout(15000);
    if (this.findObjectToDelete(documentVersionToDelete.get('id'))) {
      yield this.deleteDocumentVersion(documentVersionToDelete);
    } else {
      documentVersionToDelete.set('aboutToDelete', false);
    }
  }),

  async deleteDocument(document) {
    const documentToDelete = await document;
    if (!documentToDelete) return;
    const documentVersions = await documentToDelete.get('documentVersions');
    await Promise.all(
      documentVersions.map(async (documentVersion) => {
        return this.deleteDocumentVersion(documentVersion);
      })
    );
    documentToDelete.destroyRecord();
  },

  async deleteDocumentVersion(documentVersion) {
    const documentVersionToDelete = await documentVersion;
    if (!documentVersionToDelete) return;
    const file = documentVersionToDelete.get('file');
    await this.deleteFile(file);
    return documentVersionToDelete.destroyRecord();
  },

  async deleteFile(file) {
    const fileToDelete = await file;
    if (!fileToDelete) return;
    return fileToDelete.destroyRecord();
  },

  async reverseDelete(id) {
    const foundDocumentToDelete = this.findObjectToDelete(id);
    this.objectsToDelete.removeObject(foundDocumentToDelete);
    const record = await this.store.findRecord(
      foundDocumentToDelete.get('constructor.modelName'),
      id
    );
    record.set('aboutToDelete', false);
  },

  findObjectToDelete(id) {
    return this.objectsToDelete.find((document) => document.get('id') === id);
  },

  removeFile(id) {
    return ajax({
      method: 'DELETE',
      url: '/files/' + id,
    });
  }
});
