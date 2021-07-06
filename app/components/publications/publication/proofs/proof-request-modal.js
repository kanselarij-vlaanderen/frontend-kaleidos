import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';

class ValidatorSet {
  constructor(validators) {
    Object.assign(this, validators);
  }

  get areValid() {
    return Object.values(this).every((validator) => validator.isValid);
  }
}

class Validator {
  @tracked isErrorEnabled;

  constructor(check) {
    this.check = check;
  }

  get isValid() {
    return this.check();
  }

  @action
  enableError() {
    this.isErrorEnabled = true;
  }

  get showError() {
    return this.isErrorEnabled && !this.check();
  }
}

export default class PublicationsPublicationProofsRequestModalComponent extends Component {
  @tracked subject;
  @tracked message;
  @tracked selectedAttachments = [];
  validators = {};

  constructor() {
    super(...arguments);

    this.validators = new ValidatorSet({
      subject: new Validator(() => !isBlank(this.subject)),
      message: new Validator(() => !isBlank(this.message)),
      attachments: new Validator(() => !!this.selectedAttachments.length),
    });
    this.selectedAttachments = [...this.args.attachments]; // Copy array
    this.initEmailFields();
  }

  get isSaveDisabled() {
    return !this.validators.areValid;
  }

  async initEmailFields() {
    // should resolve immediately (already fetched)
    const identification = await this.args.publicationFlow.identification;
    const idName = identification.idName;
    this.subject = `Publicatieaanvraag VO-dossier: ${idName}`,
    this.message = proofRequestEmail({
      identifier: idName,
    });
  }


  @action
  toggleAttachmentSelection(attachment) {
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
