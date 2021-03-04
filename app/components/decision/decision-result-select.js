import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class DecisionResultSelect extends Component {
  @service store;

  @tracked decisionResultCodes;

  constructor() {
    super(...arguments);
    this.loadDecisionResultCodes.perform();
  }

  @(task(function *() {
    const codes = yield this.store.findAll('decision-result-code', {
      reload: true,
      sort: 'priority',
    });
    this.decisionResultCodes = codes;
  })) loadDecisionResultCodes;
}
