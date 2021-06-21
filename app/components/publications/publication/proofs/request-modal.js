// !! NOT READY FOR REVIEW (KAS-2475)
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';

// class AttachmentRow {
//   @tracked isSelected = false;
//   @tracked attachment;

//   constructor(attachment) {
//     this.attachment = attachment;
//   }
// }

export default class PublicationsPublicationProofsRequestModalComponent extends Component {
  @inject store;
  @inject intl;

  @tracked subject = undefined;
  @tracked shortTitle = undefined;
  @tracked longTitle = undefined;
  @tracked message = undefined;

  @tracked attachmentSelection = [];

  constructor() {
    super(...arguments);
    this.attachmentSelection = this.args.attachments;
    // this.attachmentRows = this.args.attachments.map((it) => new AttachmentRow(it));
  }

  @task
  init() {
    this.subject = `Publicatieaanvraag VO-dossier: ${this.publicationSubcase.publicationFlow.identifier}`,
    this.message = proofRequestEmail({
      identifier: this.publicationSubcase.identifier.idName,
    });
  }

  get modalTitle() {
    const title = this.intl.t('request-proof');
    const initial = this.intl.t('initial');
    return `${title} (${initial})`;
  }

  #validations = ['isSubjectValid', 'isMessageValid'];

  get isSubjectValid() {
    return !isBlank(this.subject);
  }

  get isMessageValid() {
    return !isBlank(this.message);
  }

  get canSave() {
    return this.#validations.every((validation) => this[validation]);
  }

  @task
  save() {
    const now = new Date();
    this.store.createRecord('request-activity', {
      title: this.subject,
      startDate: now,
      publicationSubcase: this.args.publicationSubcase,
      usedPieces: this.attachmentSelection,
    });
    // this.store.createRecord('email', {
    //   // from:
    // });
  }

  @action
  toggleAttachmentSelection(attachment) {
    // row.isSelected = !row.isSelected;

    if (this.attachmentSelection.includes(attachment)) {
      this.attachmentSelection.removeObject(attachment);
    } else {
      this.attachmentSelection.pushObject(attachment);
    }
  }
}
