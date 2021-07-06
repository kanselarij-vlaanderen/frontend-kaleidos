import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';

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

  static areValid(validatorsObject) {
    return Object.values(validatorsObject).every((validator) => validator.isValid);
  }
}

export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
  @tracked subject;
  @tracked message;
  @tracked selectedAttachments = [];
  validators = {};

  constructor() {
    super(...arguments);

    this.validators = {
      subject: new Validator(() => !isBlank(this.subject)),
      message: new Validator(() => !isBlank(this.message)),
    };
    this.selectedAttachments = [...this.args.attachments]; // Copy array
    this.initEmailFields();
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

  get canSave() {
    return Validator.areValid(this.validators);
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
  *onSave() {
    if (!this.canSave) {
      return; // In theory, this can't happen, since button should be disabled
    }

    const properties = {
      stage: this.args.stage,
      subject: this.subject,
      message: this.message,
      attachments: [...this.selectedAttachments],
      publicationSubcase: this.args.publicationSubcase,
    };

    yield this.args.onSave(properties);
  }
}
