import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet,
  Validator
} from 'frontend-kaleidos/utils/validators';

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
    return !this.file || !this.validators.areValid;
  }

  @task
  *saveProof() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
    });
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => !isBlank(this.name)),
    });
  }
}
