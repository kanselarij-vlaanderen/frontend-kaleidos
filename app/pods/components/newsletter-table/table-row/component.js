import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TableRowNewsletterTable extends Component {
  @service newsletterService;

  @tracked isEditing = false;
  @tracked newsletterInfo;

  constructor() {
    super(...arguments);
    this.newsletterInfo = this.args.newsletterInfo;
  }
  // Determine if a news item already was created for this agenda-item
  get hasNewsletterInfo() {
    return !!this.newsletterInfo;
  }

  @action
  async startEditing() {
    if (!this.hasNewsletterInfo) {
      this.newsletterInfo = await this.newsletterService.createNewsItemForAgendaItem(this.args.agendaItem);
    }
    this.isEditing = true;
  }

  @action
  stopEditing() {
    if (this.newsletterInfo.isDeleted) {
      this.newsletterInfo = null;
    }
    this.isEditing = false;
  }

  @action
  setInNewsletter(value) {
    this.newsletterInfo.inNewsletter = value;
    this.newsletterInfo.save();
  }
}
