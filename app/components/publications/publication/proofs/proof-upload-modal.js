import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow
 * only one of these has to be true
 * @argument {boolean} isReceived
 * @argument {boolean} isCorrected
 *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofUploadModalComponent extends Component {
  validators;

  @tracked file;
  @tracked name;
  @tracked receivedAtDate = new Date();

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
    this.validators.receivedAtDate.enableError();

    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else { // this case occurs when users manually empty the date input-field
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
