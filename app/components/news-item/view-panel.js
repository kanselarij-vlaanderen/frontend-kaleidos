import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class NewsItemViewPanelComponent extends Component {
  @service newsletterService;

  @tracked proposalText;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.proposalText = await this.newsletterService.generateNewsItemMandateeProposalText(this.args.newsItem);
  });
}
