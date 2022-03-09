import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { tracked } from '@glimmer/tracking';

/**
 * Component for manually registered publications
 * for publications that are not found in the Staatsblad (yet)
 */
export default class PublicationDetailsModal extends Component {
  @tracked publicationDate = new Date();
  @tracked mustUpdatePublicationStatus = false;

  constructor() {
    super(...arguments);
    this.initValidators();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      publicationDate: new Validator(() => this.publicationDate !== undefined),
    });
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      !this.validators.areValid || this.cancel.isRunning || this.save.isRunning
    );
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  @action
  setPublicationDate(dates) {
    if (dates.length) {
      this.publicationDate = dates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.publicationDate = undefined;
    }
    this.validators.publicationDate.enableError();
  }

  @action
  setMustUpdatePublicationStatus(e) {
    this.mustUpdatePublicationStatus = e.target.checked;
  }

  @task
  *save() {
    yield this.args.onSave({
      publicationDate: this.publicationDate,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @dropTask
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }

    yield this.args.onCancel();
  }
}
