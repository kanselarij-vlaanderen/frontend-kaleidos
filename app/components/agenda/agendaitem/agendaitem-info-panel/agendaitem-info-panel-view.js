import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsItem
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  @tracked decisionmakingFlow;
  @tracked decisionActivity;

  constructor() {
    super(...arguments);
    this.loadDecisionmakingFlow.perform();
    this.loadDecisionActivity.perform();
  }

  @task
  *loadDecisionmakingFlow() {
    if (this.args.subcase) {
      this.decisionmakingFlow = yield this.args.subcase.decisionmakingFlow;
    }
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    this.decisionActivity = yield treatment?.decisionActivity;
    yield this.decisionActivity?.decisionResultCode;
  }
}
