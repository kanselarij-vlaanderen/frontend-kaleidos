import Component from '@glimmer/component';
import { enqueueTask } from 'ember-concurrency-decorators';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { alias } from '@ember/object/computed';

export default class FileUploader extends Component{
  @service store;
  @service fileQueue;
  tagName = 'span';
  @tracked uploadedFileLength = null;
  multipleFiles = true;
  @tracked isLoading = null;
  @tracked filesInQueue = alias('fileQueue.files');
  uploadedFileAction = this.args.uploadedFileAction;

  @action
  insertElementInDom() {
    this.isLoading =  false;
    this.uploadedFileLength = 0;
    this.filesInQueue = A([]);
  }

  @enqueueTask({
    maxConcurrency: 3,
  })
  *uploadFileTask(file) {
    try {
      this.isLoading = true;
      file.readAsDataURL().then(() => {
      });
      let response = yield file.upload('/files');
      let fileTest = yield this.store.findRecord('file', response.body.data.id);
      this.uploadedFileAction(fileTest);
      this.uploadedFileLength += 1;
    } catch (e) {
      this.isLoading = false;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  uploadFile(file) {
    get(this, 'uploadFileTask').perform(file);
  }
}
