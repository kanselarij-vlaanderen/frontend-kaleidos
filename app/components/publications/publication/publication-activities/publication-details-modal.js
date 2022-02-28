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
  /**
   * @type {{
   *  publicationDetails?: {
   *    publicationDate: Date
   *  }, // omit for registration / pass for editing
   *  onCancel(): Promise,
   *  onSave(args: {
   *    publicationDate: Date,
   *    mustUpdatePublicationStatus?: boolean,
   *  }): Promise,
   * }}
   */
  args = this.args;

  @service store;

  @tracked publicationDate;
  @tracked mustUpdatePublicationStatus = false;

  constructor() {
    super(...arguments);
    this.initFields();
    this.initValidators();
  }

  get isEditing() {
    return this.args.publicationDetails !== undefined;
  }

  initFields() {
    if (this.args.publicationDetails) {
      this.publicationDate = this.args.publicationDetails.publicationDate;
    } else {
      this.publicationDate = new Date();
    }
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

  @action
  setMustUpdatePublicationStatus(e) {
    this.mustUpdatePublicationStatus = e.target.checked;
  }

  @task
  *save() {
    const args = {
      publicationDate: this.publicationDate,
    };
    if (!this.isEditing) {
      args.mustUpdatePublicationStatus = this.mustUpdatePublicationStatus;
    }

    yield this.args.onSave(args);
  }

  // prevent double cancel
  @task({
    drop: true,
  })
  *cancel() {
    // this.isCancelDisabled does not work:
    //     because this.cancel.isRunning === true, the cancel task is never performed
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }

    yield this.args.onCancel();
  }
}
