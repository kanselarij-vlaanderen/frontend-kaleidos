import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  isPresent, isBlank
} from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  validators;

  @tracked file = null;
  @tracked name = '';
  @tracked isSourceForProofPrint = false;
  @tracked receivedAtDate = new Date();

  constructor() {
    super(...arguments);

    this.initValidation();
  }

  get isSaveDisabled() {
    return isBlank(this.file) || !this.validators.areValid;
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  @task
  *saveTranslation() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
      receivedAtDate: this.receivedAtDate,
      isSourceForProofPrint: this.isSourceForProofPrint,
    });
  }

  @action
  toggleProofprint() {
    this.isSourceForProofPrint = !this.isSourceForProofPrint;
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.validators.receivedAtDate.enableError();
    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else {
      this.receivedAtDate = undefined;
    }
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
      receivedAtDate: new Validator(() => isPresent(this.receivedAtDate)),
    });
  }
}
