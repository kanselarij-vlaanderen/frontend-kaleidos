import ENV from 'frontend-kaleidos/config/environment';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class NewsItemViewPanelComponent extends Component {
  @service newsletterService;

  @tracked proposalText;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.proposalText = yield this.newsletterService.generateNewsItemMandateeProposalText(this.args.newsItem);
  }

  get sanitizeHtmlOptions() {
    return ENV['sanitize-html'];
  }
}
