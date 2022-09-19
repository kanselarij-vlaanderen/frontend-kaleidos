import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsletterInfo
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  @tracked decisionmakingFlow;

  constructor() {
    super(...arguments);
    this.loadDecisionmakingFlow.perform();
  }

  @task
  *loadDecisionmakingFlow() {
    if (this.args.subcase) {
      this.decisionmakingFlow = yield this.args.subcase.decisionmakingFlow;
    }
  }
}
