import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  isBlank,
  isEmpty
} from '@ember/utils';import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

/**
 * @argument {'initial'|'extra'|'final'} stage
 * @argument attachments
 * @argument {PublicationFlow} publicationFlow includes: identification
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
  @tracked subject;
  @tracked message;
  @tracked selectedAttachments = [];
  validators;

  constructor() {
    super(...arguments);

    this.selectedAttachments = [...this.args.attachments]; // Copy array
    this.initEmailFields();
    this.initValidators();
  }

  get isSaveDisabled() {
    return !this.validators.areValid;
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => !isBlank(this.subject)),
      message: new Validator(() => !isBlank(this.message)),
      attachments: new Validator(() => !isEmpty(this.selectedAttachments)),
    });
  }

  async initEmailFields() {
    // should resolve immediately (already fetched)
    const email = await proofRequestEmail({
      stage: this.args.stage,
      publicationFlow: this.args.publicationFlow,
    });
    this.subject = email.subject;
    this.message = email.message;
  }

  @action
  toggleAttachmentSelection(attachment) {
    this.validators.attachments.enableError();

    if (this.selectedAttachments.includes(attachment)) {
      this.selectedAttachments.removeObject(attachment);
    } else {
      this.selectedAttachments.pushObject(attachment);
    }
  }

  @task
  *saveRequest() {
    yield this.args.onSave({
      stage: this.args.stage,
      subject: this.subject,
      message: this.message,
      attachments: [...this.selectedAttachments],
      publicationSubcase: this.args.publicationSubcase,
    });
  }
}
