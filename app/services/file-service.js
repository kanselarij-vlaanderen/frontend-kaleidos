import Service from '@ember/service';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';

export default Service.extend({
  globalError: inject(),
  store: inject(),
  shouldUndoChanges: false,
  documentsToDelete: [],

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
    this.documentsToDelete.push(documentToDelete);
    documentToDelete.set('aboutToDelete', true);
    yield timeout(10000);
    if (this.findObjectToDelete(documentToDelete.get('id'))) {
      documentToDelete.destroyRecord();
    } else {
      documentToDelete.set('aboutToDelete', false);
    }
    this.globalError.set('shouldUndoChanges', false);
  }),

  async reverseDelete(id) {
    const foundDocumentToDelete = this.findObjectToDelete(id);
    this.documentsToDelete.removeObject(foundDocumentToDelete);
    const record = await this.store.findRecord(
      foundDocumentToDelete.get('constructor.modelName'),
      id
    );
    record.set('aboutToDelete', false);
  },

  findObjectToDelete(id) {
    return this.documentsToDelete.find((document) => document.get('id') === id);
  },

  removeFile(id) {
    return $.ajax({
      method: 'DELETE',
      url: '/files/' + id,
    });
  },

  getAllDocumentsFromAgenda(agendaId) {
    return $.ajax({
      method: 'GET',
      url: `/document-grouping-service/getDocumentsFromAgenda/${agendaId}`,
    })
      .then((result) => {
        return result.data.files;
      })
      .catch(() => {
        return;
      });
  },

  getZippedFiles(date, agenda, files) {
    return $.ajax({
      method: 'POST',
      url: `/file-bundling-service/bundleAllFiles`,
      dataType: 'arraybuffer', // or 'blob'
      data: {
        meetingDate: date.toString(),
        agenda: JSON.stringify(agenda),
        files: JSON.stringify(files),
      },
    })
      .then((content) => {
        return content;
      })
      .catch(() => {
        return;
      });
  },
});
