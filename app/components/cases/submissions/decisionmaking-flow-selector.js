import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { LIVE_SEARCH_DEBOUNCE_TIME } from 'frontend-kaleidos/config/config';

export default class CasesSubmissionsDecisionmakingFlowSelectorComponent extends Component {
  @service store;

  @tracked isAddingNewDecisionmakingFlow;
  @tracked decisionmakingFlowTitle;
  @tracked selectedDecisionmakingFlow;

  constructor() {
    super(...arguments);

    this.selectedDecisionmakingFlow = this.args.selectedDecisionmakingFlow;
    if (this.selectedDecisionmakingFlow) {
      this.decisionmakingFlowTitle = this.selectedDecisionmakingFlow?.case?.title;
    } else {
      this.decisionmakingFlowTitle = this.args.selectedDecisionmakingFlowTitle;
    }
  }

  get decisionmakingFlowOrTitle() {
    return this.decisionmakingFlowTitle ?? this.selectedDecisionmakingFlow;
  }

  searchDecisionmakingFlows = task(async (title) => {
    await timeout(LIVE_SEARCH_DEBOUNCE_TIME);
    return await this.store.query(
      'decisionmaking-flow',
      { 'filter[case][short-title]': title,
        include: 'case' },
    );
  });

  onSelectDecisionmakingFlow = (decisionmakingFlow) => {
    this.decisionmakingFlowTitle = null;
    this.selectedDecisionmakingFlow = decisionmakingFlow;

    this.args.onChangeTitle?.(null);
    this.args.onChangeSelected?.(decisionmakingFlow);
  }

  onChangeDecisionmakingFlowTitle = (title) => {
    this.decisionmakingFlowTitle = title;
    this.selectedDecisionmakingFlow = null;

    this.args.onChangeTitle?.(title);
    this.args.onChangeSelected?.(null);

  }
}
