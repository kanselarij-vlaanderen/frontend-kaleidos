import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  isNone, isPresent
} from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet,
  Validator
} from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow
 * @argument {'proof'|'correction'} source
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofUploadModalComponent extends Component {
  validators
  @tracked file;
  @tracked name = '';
  @tracked receivedAtDate = new Date();

  constructor() {
    super(...arguments);

    this.initValidation();
  }

  get isSaveDisabled() {
    return !this.file || !this.validators.areValid;
  }

  @task
  *saveProof() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
      receivedAtDate: this.receivedAtDate,
    });
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  @action
  setReceivedAtDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else {
      this.receivedAtDate = undefined;
      this.validators.receivedAtDate.enableError();
    }
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
      receivedAtDate: new Validator(() => !isNone(this.receivedAtDate)),
    });
  }
}
