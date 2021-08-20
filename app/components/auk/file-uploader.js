import Component from '@glimmer/component';
import { enqueueTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import {
  action,
  setProperties
} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

/**
 * @argument {Boolean} fullHeight Stretch the upload zone over the full height
 * @argument {Boolean} multiple (optional) allow uploading multiple files
 * @argument {String} accept (optional)
 * @argument {String} fileQueueName (optional) Name of the file queue to use.
 *   Setting this name will allow you to access this queue from the file-queue service outside of this component.
 * @argument {Function} onUpload: action fired for each file that gets uploaded. Passes a semantic.works File as an argument,
 */
export default class FileUploader extends Component {
  @service store;
  @service('file-queue') fileQueueService;

  @tracked uploadedFileLength; // The amount of files that have been uploaded successfully

  constructor() {
    super(...arguments);
    this.uploadedFileLength = 0;
    const queue = this.fileQueue || this.fileQueueService.create(this.fileQueueName);
    setProperties(queue, { // https://github.com/adopted-ember-addons/ember-file-upload/blob/888273b997d0336841daa1fb24287b5f5c5c9d62/addon/components/base-component.js#L13
      accept: this.args.accept,
      multiple: this.args.multiple,
      // disabled,
      onfileadd: this.uploadFileTaskAction,
    });
  }

  get fileQueueName() {
    return this.args.fileQueueName || `${guidFor(this)}-file-queue`;
  }

  get fileQueue() {
    return this.fileQueueService.find(this.fileQueueName);
  }

  get uploadIsCompleted() {
    return this.uploadedFileLength > 0
      && (!this.fileQueue.files.length); // "queue automatically gets flushed when all the files in the queue have settled"
  }

  get uploadIsRunning() {
    return this.fileQueue.get('files.length') > 0 // getter since things internal to file-upload aren't tracked
      || this.uploadFileTask.isRunning;
  }

  @enqueueTask({
    maxConcurrency: 3,
  }) *uploadFileTask(file) {
    try {
      const response = yield file.upload('/files');
      const fileFromStore = yield this.store.findRecord('file', response.body.data.id);
      if (this.args.onUpload) {
        this.args.onUpload(fileFromStore);
      }
      this.uploadedFileLength += 1;
    } catch (exception) {
      console.warn('An exception occurred', exception);
    }
  }

  // Wrapper for task invocation, since direct task perform doesn't work because of ember-file-upload internals
  @action
  uploadFileTaskAction() {
    return this.uploadFileTask.perform(...arguments);
  }

  // Replacement for https://github.com/adopted-ember-addons/ember-file-upload/blob/888273b997d0336841daa1fb24287b5f5c5c9d62/addon/components/file-upload/component.js#L149
  // beware that this taps into a private `ember-file-upload`-method, which makes this susceptible to breaking when version-bumping `ember-file-upload`
  @action
  addFilesToQueue(event) {
    const files = event.target.files;
    this.fileQueue._addFiles(files, 'browse');
    event.target.value = null;
  }

  @action
  clickInputOnEnter(event) {
    if (event.key === 'Enter') {
      this.clickInput(event);
    }
  }

  @action
  clickInput(event) {
    event.target
      .closest('.auk-file-upload').querySelector('input')
      .click();
  }
}
