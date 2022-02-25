import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { tracked } from '@glimmer/tracking';

/**
 * Component for manually registered publications
 * for publications that are not found in the Staatsblad (yet)
 */
export default class PublicationRegistrationModal extends Component {
  @service store;

  @tracked publicationDate = new Date();
  @tracked mustUpdatePublicationStatus = false;

  constructor() {
    super(...arguments);
    this.initValidation();
  }

  initValidation() {
    this.validators = new ValidatorSet({
      publicationDate: new Validator(() => this.publicationDate !== undefined),
    });
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      !this.validators.areValid || this.cancel.isRunning || this.save.isRunning
    );
  }

  @action
  setPublicationDate(dates) {
    this.publicationDate = dates[0];
    this.validators.publicationDate.enableError();
  }

  @action
  setMustUpdatePublicationStatus(e) {
    this.mustUpdatePublicationStatus = e.target.checked;
  }

  // prevent double cancel
  @task({
    drop: true,
  })
  *cancel() {
    // this.canCancel does not work:
    //     because this.cancel.isRunning === true, the cancel task is never performed
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }

    yield this.args.onCancel();
  }

  @task
  *save() {
    const args = {
      publicationDate: this.publicationDate,
      shouldSetPublished: this.mustUpdatePublicationStatus,
    };
    yield this.args.onSave(args);
  }
}
