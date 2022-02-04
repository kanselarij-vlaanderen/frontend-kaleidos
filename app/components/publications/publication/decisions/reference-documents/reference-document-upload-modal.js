import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationDecisionsReferenceDocumentUploadModalComponent extends Component {
  validators;

  @tracked file;
  @tracked name;
  @tracked pageCount;

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

  // prevent double cancel
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
    this.args.onCancel();
  }

  @task
  *save() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
      pageCount: this.pageCount,
    });
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
    });
  }
}
