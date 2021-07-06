import Component from '@glimmer/component';
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

export default class PublicationsPublicationProofsProofUploadModalComponent extends Component {
  validators
  @tracked file;
  @tracked name;

  constructor() {
    super(...arguments);

    this.initValidation();
  }

  get isCancelDisabled() {
    return this.saveProof.isRunning;
  }

  get isSaveDisabled() {
    return !this.file || !Validator.areValid(this.validators);
  }

  @task
  *saveProof() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
    });
  }

  initValidation() {
    this.validators = {
      name: new Validator(() => !isBlank(this.name)),
    };
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }
}
