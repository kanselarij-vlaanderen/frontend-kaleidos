import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';

export default class PublicationRequestModal extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked uploads = [];

  constructor() {
    super(...arguments);

    // initialize validation before first render: to avoid this.validators === undefined
    this.initValidators();
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

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
      pieces: new Validator(() => this.uploads.length > 0),
    });
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get canSave() {
    return (
      this.validators.areValid && !this.cancel.isRunning && !this.save.isRunning
    );
  }

  get canCancel() {
    return !this.cancel.isRunning && !this.save.isRunning;
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

  get pieces() {
    return this.uploads.mapBy('piece');
  }

  @action
  createPiece(file) {
    const created = file.created;

    const documentContainer = this.store.createRecord('document-container', {
      created: created,
    });

    const piece = this.store.createRecord('piece', {
      created: created,
      modified: created,
      confidential: false,
      name: file.filenameWithoutExtension,
      file: file,
      documentContainer: documentContainer,
    });

    this.uploads.pushObject({
      piece: piece,
      file: file,
      documentContainer: documentContainer,
    });
  }

  @task
  *save() {
    const requestParams = {
      subject: this.subject,
      message: this.message,
      uploads: this.uploads,
    };
    yield this.args.onSave(requestParams);
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

  // separate method to prevent ember-concurrency from saving only partially
  performCleanup() {
    return Promise.all(
      this.uploads.map((upload) => upload.file.destroyRecord())
    );
  }
}
