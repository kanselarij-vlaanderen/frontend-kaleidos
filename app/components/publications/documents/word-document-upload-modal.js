import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, dropTask } from 'ember-concurrency-decorators';

/**
 * @argument {Piece} piece
 * @argument {Function} onSave Function should take a file argument, which is the uploaded Word document to be stored
 * @argument {Function} onCancel
 */
export default class PublicationsDocumentsWordDocumentUploadModalComponent extends Component {
  @service publicationService;

  file;

  allowedExtensions = ['.doc', '.docx'];
  allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor() {
    super(...arguments);
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  @action
  validateFile(file) {
    return this.allowedTypes.includes(file.type);
  }

  @action
  onUpload(file) {
    this.file = file;
  }

  @dropTask
  *cancel() {
    yield this.args.onCancel();
  }

  @task
  *save() {
    yield this.args.onSave(this.file);
  }
}
