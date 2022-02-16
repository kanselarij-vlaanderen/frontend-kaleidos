import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';

export default class PublicationTimelineEventPanel extends Component {
  @tracked subject;
  @tracked message;
  @tracked files = [];

  constructor() {
    super(...arguments);

    // initialize validation before first render: to avoid this.validators === undefined
    this.initValidation();
    this.initEmail();
  }

  async initEmail() {
    // should resolve immediately (already fetched)
    const email = await publicationRequestEmail({
      publicationFlow: this.args.publicationFlow,
    });
    this.subject = email.subject;
    this.message = email.message;
  }

  initValidation() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
      files: new Validator(() => this.files.length > 0),
    });
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get canCancel() {
    return !this.cancel.isRunning && !this.save.isRunning;
  }

  get canSave() {
    return (
      this.validators.areValid && !this.cancel.isRunning && !this.save.isRunning
    );
  }

  @action
  setSubject(e) {
    this.subject = e.target.value;
    this.validators.subject.enableError();
  }

  @action
  setMessage(e) {
    this.message = e.target.value;
    this.validators.message.enableError();
  }

  @action
  didUpload(file) {
    this.files.pushObject(file);
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

    yield this.performCleanup();
    yield this.args.onCancel();
  }

  @task
  *save() {
    const requestParams = {
      subject: this.subject,
      message: this.message,
      files: this.files,
    };
    yield this.args.onSave(requestParams);
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performCleanup() {
    await Promise.all(this.files.map((file) => file.destroyRecord()));
  }
}
