import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CasesStatusPill extends Component {
  @service store;
  @service intl;

  @tracked statusText = null;

  constructor() {
    super(...arguments);
    this.loadStatusText.perform();
  }

  loadStatusText = task(async () => {
    if (!this.args.case) {
      throw new Error('@case argument is required');
    }

    const decisionmakingFlow = await this.args.case.decisionmakingFlow;
    // Note: probably better to include subcase type here but did not work
    const subcase = await this.store.queryOne('subcase', {
      'filter[decisionmaking-flow][:id:]': decisionmakingFlow.id,
      sort: '-created',
    });
    if (subcase) {
      const subcaseType = await subcase.type;
      if (subcaseType) {
        this.statusText = subcaseType.label;
      }
    }
  });
}
