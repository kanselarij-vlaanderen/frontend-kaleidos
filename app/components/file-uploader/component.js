import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import { observer } from '@ember/object';

export default Component.extend({
  store: inject(),
  fileQueue: inject(),
  tagName: "span",
  files: null,
  uploadedFileLength: null,
  multipleFiles: true,

  didInsertElement() {
    this._super(...arguments);
    this.set('uploadedFileLength', 0);
    this.store.findAll('document-type',
      {
        sort: "priority",
        page: { size: 50 }
      }).then((types) => {
        return types;
      });
  },

  isNotLoading: observer('fileQueue.files.@each', function () {
    const length = this.fileQueue.get('files.length');
    if (length === 0) {
      this.set('isLoading', false);
      this.set('uploadedFileLength', 0);
    }
  }),

  uploadFile: task(function* (file) {
    try {
      file.readAsDataURL().then(() => {
      });
      // yield is being used to pause the execution of the promise behind it
      let response = yield file.upload('/files');
      let fileTest = yield this.store.findRecord('file', response.body.data.id);
      this.uploadedFile(fileTest);
      this.incrementProperty('uploadedFileLength');
    } catch (e) {
      this.set('isLoading', false);
      // TODO: Error handling
    }
  }).maxConcurrency(3).enqueue(),

  actions: {
    uploadFile(file) {
      this.set('isLoading', true);
      get(this, 'uploadFile').perform(file);
    },

    uploadedFile(uploadedFile) {
      this.uploadedFile(uploadedFile);
    }
  }
});
