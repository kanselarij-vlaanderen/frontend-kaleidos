import Service, { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';
import { later } from '@ember/runloop';
import fetch from 'fetch';
import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Service.extend(FileSaverMixin, {
  globalError: inject(),
  store: inject(),
  sessionService: inject(),
  intl: inject(),
  shouldUndoChanges: false,
  objectsToDelete: [],
  currentAgenda: alias('sessionService.currentAgenda'),

  convertDocumentVersion(documentVersion) {
    try {
      $.ajax({
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
      console.error(e, 'something went wrong with the conversion');
    }
  },

  deleteDocumentWithUndo: task(function*(documentToDelete) {
    this.objectsToDelete.push(documentToDelete);
    documentToDelete.set('aboutToDelete', true);
    yield timeout(10000);
    if (this.findObjectToDelete(documentToDelete.get('id'))) {
      yield this.deleteDocument(documentToDelete);
    } else {
      documentToDelete.set('aboutToDelete', false);
    }
    this.globalError.set('shouldUndoChanges', false);
  }),

  deleteDocumentVersionWithUndo: task(function*(documentVersionToDelete) {
    this.objectsToDelete.push(documentVersionToDelete);
    documentVersionToDelete.set('aboutToDelete', true);
    yield timeout(10000);
    if (this.findObjectToDelete(documentVersionToDelete.get('id'))) {
      yield this.deleteDocumentVersion(documentVersionToDelete);
    } else {
      documentVersionToDelete.set('aboutToDelete', false);
    }
    this.globalError.set('shouldUndoChanges', false);
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
    return $.ajax({
      method: 'DELETE',
      url: '/files/' + id,
    });
  },

  downloadBundle(agendaId, meetingDate) {
    return fetch(`/file-bundling-service/bundleAllFiles?agenda_id=${agendaId}`, {
      method: 'POST'
    }).then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(response)
      }
    }).then(path => {
      this.toast('bundling-started');
      return this.tryDownload(path);
    }).then(file => {
      return this.saveFileAs(`${this.currentAgenda.get('agendaName')}_${meetingDate}.zip`, file, 'application/zip');
    }).then(() => {
      return this.toast('bundling-done', 'success', 'successfully-created-title');
    }).catch(err => {
      this.toast('bundling-failed', 'error');
      throw new Error(err);
    });

  },

  tryDownload(path, countdown = 5) {
    return fetch(`/file-bundling-service/downloadBundle?path=${path}`)
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        } else if (response.status === 202) {
          return new Promise((resolve, reject) =>
            later(this, () => this.tryDownload(path, --countdown)
              .then(res => resolve(res))
              .catch(err => reject(err)), Math.max(1000 * countdown, 1000)));
        } else {
          throw new Error(response)
        }
      })
      .catch(err => {
        this.toast('bundling-failed', 'error');
        throw new Error(err);
      });
  },

  toast(messageKey, type = 'warning', titleKey = 'warning-title') {
    return this.globalError.showToast.perform(
      EmberObject.create({
        title: this.intl.t(titleKey),
        message: this.intl.t(messageKey),
        type
      })
    );
  }
});
