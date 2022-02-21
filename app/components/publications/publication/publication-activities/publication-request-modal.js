import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, taskGroup } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { publicationRequestEmail } from 'frontend-kaleidos/utils/publication-email';

export default class PublicationTimelineEventPanel extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked pieces = [];

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
      pieces: new Validator(() => this.pieces.length > 0),
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

  @taskGroup taskGroup;
  @task({
    group: 'taskGroup'
  })
  *savePiece(file) {
    const piece = yield this.performSavePiece(file);
    this.pieces.pushObject(piece);
  }

  async performSavePiece(file) {
    const created = file.created;

    const documentContainer = this.store.createRecord('document-container', {
      created: created,
    });
    await documentContainer.save();

    const piece = this.store.createRecord('piece', {
      created: created,
      modified: created,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    await piece.save();

    return piece;
  }

  @task({
    group: 'taskGroup',
  })
  *cancel() {
    yield this.performCleanup();
    yield this.args.onCancel();
  }

  @task({
    group: 'taskGroup',
  })
  *save() {
    const requestParams = {
      subject: this.subject,
      message: this.message,
      pieces: this.pieces,
    };
    yield this.args.onSave(requestParams);
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performCleanup() {
    await Promise.all(this.pieces.map((piece) =>
      Promise.all([
        piece.file.destroyRecord(),
        piece.documentContainer.destroyRecord(),
        piece.destroyRecord(),
      ])
    ));
  }
}
