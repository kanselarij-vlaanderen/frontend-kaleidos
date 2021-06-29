import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

class Validator {
  @tracked isErrorEnabled;

  constructor(check) {
    this.check = check;
  }

  get isValid() {
    return this.check();
  }

  @action
  enableError() {
    this.isErrorEnabled = true;
  }

  get showError() {
    return this.isErrorEnabled && !this.check();
  }

  static areValid(validatorsObject) {
    return Object.values(validatorsObject).every((validator) => validator.isValid);
  }
}

export default class PublicationsPublicationProofsUploadDocumentModalComponent extends Component {
  @service('file-queue') fileQueueService;

  // isSaved;
  validators
  @tracked file;
  @tracked name;

  constructor() {
    super(...arguments);

    this.#initValidation();
  }

  #initValidation() {
    this.validators = {
      name: new Validator(() => !isBlank(this.name)),
    };
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  get canCancel() {
    return !this.onSave.isRunning;
  }

  get canSave() {
    return Validator.areValid(this.validators) && !this.onSave.isRunning;
  }

  @task
  *onSave() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
    });
  }
}
