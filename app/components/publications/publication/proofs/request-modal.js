/* eslint-disable no-dupe-class-members */
// !! NOT READY FOR REVIEW (KAS-2475)
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';

class Validation {
  @tracked isErrorEnabled;

  constructor(
    check) {
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
  @service intl;

  @tracked subject = undefined;
  @tracked shortTitle = undefined;
  @tracked longTitle = undefined;
  @tracked message = undefined;
  @tracked selectedAttachments = [];
  validations = {};

  constructor() {
    super(...arguments);
    this.#init();
  }

  async #init() {
    this.validations.subject = new Validation(() => !isBlank(this.subject));
    this.validations.message = new Validation(() => !isBlank(this.message));
    this.selectedAttachments = [...this.args.attachments];
    const identification = this.args.publicationFlow.identification;
    const idName = identification.get('idName');
    this.subject = `Publicatieaanvraag VO-dossier: ${idName}`,
    this.message = proofRequestEmail({
      identifier: idName,
    });
  }

  get modalTitle() {
    const title = this.intl.t('request-proof');
    const initial = this.intl.t('initial');
    return `${title} (${initial})`;
  }

  get canSave() {
    return Object.entries(this.validations).every(([, validation]) => validation.isValid);
  }

  @task
  *onSave() {
    if (!this.canSave) {
      return;
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

  @action
  toggleAttachmentSelection(attachment) {
    if (this.selectedAttachments.includes(attachment)) {
      this.selectedAttachments.removeObject(attachment);
    } else {
      this.selectedAttachments.pushObject(attachment);
    }
  }
}
