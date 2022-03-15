import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { tracked } from '@glimmer/tracking';

/**
 * Component for manually updating a publication date
 * for publications that are not found in the Staatsblad (yet)
 */
export default class PublicationEditModal extends Component {
  @tracked publicationDate;

  constructor() {
    super(...arguments);
    this.publicationDate = this.args.publicationDate;
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
    this.publicationDate = dates[0];
    this.validators.publicationDate.enableError();
  }

  @task
  *save() {
    yield this.args.onSave({
      publicationDate: this.publicationDate,
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
