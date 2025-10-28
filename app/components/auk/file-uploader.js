import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { enqueueTask } from 'ember-concurrency';
import { isEnabledCabinetSubmissions } from '../../utils/feature-flag';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

/**
 * @argument {Boolean} fullHeight Stretch the upload zone over the full height
 * @argument {Boolean} multiple (optional) allow uploading multiple files
 * @argument {Boolean} reusable (optional, False by default) allow reusing the uploader to upload even more files, or add new files after previous uploads were deleted.
 * @argument {String} fileQueueName (optional) Name of the file queue to use.
 *  Setting this name will allow you to access this queue from the file-queue service outside of this component.
 * @argument {Function} onUpload: action fired for each file that gets uploaded. Passes a semantic.works File as an argument,
 * @argument {Function} validateFile: function run to validate files before sending them to the backend.
 *  Takes in a File and should return a boolean (whether the file is valid or not). See: https://developer.mozilla.org/en-US/docs/Web/API/File
 * @argument {Function} onQueueUpdate: function that is called whenever the file queue's state changes, can be used to determine if an upload is ongoing
 */
export default class FileUploader extends Component {
  @service store;
  @service('file-queue') fileQueueService;
  @service toaster;
  @service intl;

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

  get queueInfo() {
    return {
      uploadIsRunning: this.uploadIsRunning,
      uploadIsCompleted: this.uploadIsCompleted,
    };
  }

  @enqueueTask({
    maxConcurrency: 3,
  }) *uploadFileTask(file) {
    try {
      const uppercasePDFIndex = file?.name?.lastIndexOf('.PDF');
      if (uppercasePDFIndex === file?.name?.length - 4) {
        const originalName = file.name;
        file.name = originalName.slice(0, uppercasePDFIndex) + '.pdf';
      }
      this.args.onQueueUpdate?.(this.queueInfo);
      let body;
      try {
        const response = yield file.upload(
          (this.args.isSubmission && isEnabledCabinetSubmissions())
            ? '/draft-files'
            : '/files'
        );
        body = yield getJsonPayloadOrThrow(response);
      } catch (error) {
        this.toaster.error(
          this.intl.t('could-not-upload-file', {name: file.name, error: error.message}),
          this.intl.t('warning-title')
        );
        // manually remove failed file from queue to unblock the queue
        this.fileQueue.remove(file);
        throw error;
      }
      const fileFromStore = yield this.store.findRecord(
        (this.args.isSubmission && isEnabledCabinetSubmissions())
          ? 'draft-file'
          : 'file',
        body.data.id
      );
      if (this.args.onUpload) {
        this.args.onUpload(fileFromStore);
      }
      this.uploadedFileLength += 1;
      this.args.onQueueUpdate?.(this.queueInfo);
    } catch (exception) {
      console.warn('An exception occurred', exception);
      this.args.onQueueUpdate?.(this.queueInfo);
    }
  }

  @action
  validateFile(file) {
    return this.args.validateFile?.(file) ?? true;
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
