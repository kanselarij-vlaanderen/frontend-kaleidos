import Component from '@glimmer/component';
import { enqueueTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

/**
 * @argument {Boolean} fullHeight Stretch the upload zone over the full height
 * @argument {Boolean} multiple (optional) allow uploading multiple files
 * @argument {Boolean} reusable (optional, False by default) allow reusing the uploader to upload even more files, or add new files after previous uploads were deleted.
 * @argument {String} fileQueueName (optional) Name of the file queue to use.
 *   Setting this name will allow you to access this queue from the file-queue service outside of this component.
 * @argument {Function} onUpload: action fired for each file that gets uploaded. Passes a semantic.works File as an argument,
 * @argument {String} accept: attribute passed to the <input> element to tell the browser which types of files it should accept. Note: this does not do validation, use `onDrop` for that.
 * This attribute can be used to improve user experience by making the browser's file chooser only show the expected files by default.
 * @argument {Function} validateFile: Action fired after files entered the queue, but before being created in the backend. Used to validate passed in files.
 * Function should return a boolean based on if the file is valid or not, more info on custom validation: @see https://adopted-ember-addons.github.io/ember-file-upload/versions/v5.0.0-beta.0/docs/validation
 */
export default class FileUploader extends Component {
  @service store;
  @service('file-queue') fileQueueService;

  @tracked uploadedFileLength; // The amount of files that have been uploaded successfully

  constructor() {
    super(...arguments);
    this.uploadedFileLength = 0;
    const queue = this.fileQueue || this.fileQueueService.create(this.fileQueueName);
    queue.addListener({
      onFileAdded: this.uploadFileTask.perform,
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
    return this.fileQueue.files.length > 0
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
