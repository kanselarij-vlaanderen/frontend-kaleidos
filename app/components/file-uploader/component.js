import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { get } from '@ember/object';

export default Component.extend({
	classNames:["file-upload-container"],
	uploadFile: task(function * (file) {		
    try {
      file.readAsDataURL().then(() => {});
			// yield is being used to pause the execution of the promise behind it
			yield file.upload('files');
    } catch (e) {
			// TODO: Error handling
    }
  }).maxConcurrency(3).enqueue(),

  actions: {
    uploadFile(file) {
      get(this, 'uploadFile').perform(file);
    }
  }
});
