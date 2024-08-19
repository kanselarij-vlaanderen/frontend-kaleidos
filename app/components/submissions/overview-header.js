import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class SubmissionsOverviewHeaderComponent extends Component {
  @service router;

  @tracked decisionmakingFlow;
  @tracked case;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.decisionmakingFlow = await this.args.submission.decisionmakingFlow;
    this.case = await this.decisionmakingFlow?.case;
  });

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }
}
