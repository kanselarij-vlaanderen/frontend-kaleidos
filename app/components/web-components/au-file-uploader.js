import Component from '@glimmer/component';
import { enqueueTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { alias } from '@ember/object/computed';

export default class FileUploader extends Component {
  @service store;

  @service fileQueue;

  tagName = 'span';

  @tracked uploadedFileLength = null;

  multipleFiles = this.args.multipleFiles;

  @tracked filesInQueue = alias('fileQueue.files');
  uploadedFileAction = this.args.uploadedFileAction;

  @action
  insertElementInDom() {
    this.uploadedFileLength = 0;
    this.filesInQueue = A([]);
  }

  @enqueueTask({
    maxConcurrency: 3,
  }) *uploadFileTask(file) {
    try {
      const response = yield file.upload('/files');
      const fileFromStore = yield this.store.findRecord('file', response.body.data.id);
      this.uploadedFileAction(fileFromStore);
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
