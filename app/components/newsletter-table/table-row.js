import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class TableRowNewsletterTable extends Component {
  @service newsletterService;
  @service intl;
  @service toaster;

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
      this.newsletterInfo = await this.newsletterService.createNewsItemForAgendaitem(this.args.agendaitem);
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

  @(task(function *() {
    yield this.newsletterInfo.save();
  })) saveNewsletterInfoTask;

  @action
  async setInNewsletter(value) {
    this.newsletterInfo.inNewsletter = value;
    await this.saveNewsletterInfoTask.perform();
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
