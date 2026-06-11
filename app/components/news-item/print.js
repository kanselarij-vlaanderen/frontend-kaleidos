import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class NewsItemPrintComponent extends Component {
  @service newsletterService;
  @service currentSession;

  @tracked proposalText;
  @tracked themes;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    if (this.args.newsItem) {
      this.proposalText = await this.newsletterService.generateNewsItemMandateeProposalText(this.args.newsItem);
      this.themes = await this.args.newsItem.themes;
    }
  });

  @action
  async openEdit() {
    await this.args.newsItem?.preEditOrSaveCheck();
    this.isEditing = true;
  }

  @action
  async closeEdit() {
    await this.args.newsItem?.stopEditingOnCancel(this.currentSession.user);
    this.isEditing = false;
  }

  @action
  async save() {
    await this.args.onSave(this.args.newsItem);
    this.isEditing = false;
  }
}
