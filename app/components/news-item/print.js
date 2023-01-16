import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class NewsItemPrintComponent extends Component {
  @service newsletterService;

  @tracked proposalText;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    if (this.args.newsItem) {
      this.proposalText = yield this.newsletterService.generateNewsItemMandateeProposalText(this.args.newsItem);
    }
  }

  @action
  openEdit() {
    this.isEditing = true;
  }

  @action
  closeEdit() {
    this.isEditing = false;
  }

  @action
  async save() {
    await this.args.onSave();
    this.closeEdit();
  }
}
