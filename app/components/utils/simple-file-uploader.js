// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';
import { A } from '@ember/array';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: inject(),
  fileQueue: inject(),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-component-lifecycle-hooks
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

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    uploadFile(file) {
      this.uploadFile.perform(file);
    },

    uploadedFile(uploadedFile) {
      this.uploadedFile(uploadedFile);
    },
  },
});
