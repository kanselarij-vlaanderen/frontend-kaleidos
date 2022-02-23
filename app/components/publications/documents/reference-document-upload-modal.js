import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency-decorators';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsDocumentsReferenceDocumentUploadModalComponent extends Component {
  validators;

  @tracked file;
  @tracked name;

  constructor() {
    super(...arguments);

    this.initValidation();
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.file || this.file.isDeleted || !this.validators.areValid;
  }

  @dropTask
  *cancel() {
    if (!this.save.isRunning) {
      if (this.file) {
        yield this.file.destroyRecord();
      }
      this.args.onCancel();
    } else {
      // close-button is not disabled when saving
    }
  }

  @task
  *save() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
    });
  }

  @action
  setFileProperties(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
    });
  }
}
