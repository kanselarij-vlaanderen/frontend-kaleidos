import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { get } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  store:inject(),
  classNames:["file-upload-container"],
  files: null,
  multipleFiles: true,
  
	uploadFile: task(function * (file) {		
    try {
      file.readAsDataURL().then(() => {});
      // yield is being used to pause the execution of the promise behind it
      let response = yield file.upload('/files');
      let fileTest = yield this.store.findRecord('file', response.body.data.id);
      this.set('files', fileTest);
    } catch (e) {
			// TODO: Error handling
    }
  }).maxConcurrency(3).enqueue(),

  actions: {
    async uploadFile(file) {
      await get(this, 'uploadFile').perform(file);
      this.uploadedFile(this.get('files'));
    },

    uploadedFile(uploadedFile) {
      this.uploadedFile(uploadedFile);
    }
  }
});
