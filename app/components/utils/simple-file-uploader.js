import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import { A } from '@ember/array';

export default Component.extend({
  store: inject(),
  fileQueue: inject(),

  didInsertElement() {
    this._super(...arguments);
    this.set('fileQueue.files', A([]));
  },

  uploadFile: task(function *(file) {
    file.readAsDataURL().then(() => {
    });
    const response = yield file.upload('/user-management-service/import-users');
    this.uploadedFile(response);
  }).enqueue(),

  actions: {
    uploadFile(file) {
      get(this, 'uploadFile').perform(file);
    },

    uploadedFile(uploadedFile) {
      this.uploadedFile(uploadedFile);
    },
  },
});
