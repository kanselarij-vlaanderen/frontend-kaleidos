import Component from '@glimmer/component';
import { enqueueTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FileUploader extends Component {
  @service store;

  @service fileQueue;

  @tracked uploadedFileLength = null;

  @action
  insertElementInDom() {
    this.uploadedFileLength = 0;
  }

  @enqueueTask({
    maxConcurrency: 3,
  }) *uploadFileTask(file) {
    try {
      const response = yield file.upload('/files');
      const fileFromStore = yield this.store.findRecord('file', response.body.data.id);
      this.args.uploadedFileAction(fileFromStore);
      this.uploadedFileLength += 1;
    } catch (exception) {
      console.warn('An exception occurred', exception);
    }
  }

  @action
  uploadFile(file) {
    this.uploadedFileLength = 0;
    this.uploadFileTask.perform(file);
  }
}
