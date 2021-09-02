import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { isPresent } from '@ember/utils';

export default class  DocumentsDocumentPreviewNewVersionModalComponent extends Component {
  @service fileService;

  @tracked file;
  @tracked name;

  validators;

  constructor() {
    super(...arguments);
    this.initValidation();
  }

  get isLoading() {
    return this.save.isRunning || this.cancel.isRunning;
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.file || this.file.isDeleted || !this.validators.areValid;
  }

  @task
  *deleteUploadedFile() {
    if (this.file) {
      yield this.fileService.deleteFile(this.file);
      this.file = null;
    }
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = this.args.newVersionName;
  }

  @task({
    drop: true,
  })
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }
    if (this.file) {
      yield this.file.destroyRecord();
    }
    this.args.onClose();
  }

  @task
  *save() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
    });
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
    });
  }
}
