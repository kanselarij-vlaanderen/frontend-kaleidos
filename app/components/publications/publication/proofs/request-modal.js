import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';

class AttachmentRow {
  @tracked isSelected = false;
  @tracked attachment;

  constructor(attachment) {
    this.attachment = attachment;
  }
}

export default class PublicationsPublicationProofsRequestModalComponent extends Component {
  @inject intl;

  @tracked subject = undefined;
  @tracked shortTitle = undefined;
  @tracked longTitle = undefined;
  @tracked message = undefined;

  // @tracked attachmentSelection = [];
  @tracked attachmentRows;

  constructor() {
    super(...arguments);
    this.attachmentRows = this.args.attachments.map((it) => new AttachmentRow(it));
  }

  get modalTitle() {
    const title = this.intl.t('request-proof');
    const initial = this.intl.t('initial');
    return `${title} (${initial})`;
  }

  @action
  toggleAttachmentSelection(row) {
    row.isSelected = !row.isSelected;

    // if (this.attachmentSelection.includes(attachment)) {
    //   this.attachmentSelection.removeObject(attachment);
    // } else {
    //   this.attachmentSelection.pushObject(attachment);
    // }
  }
}
