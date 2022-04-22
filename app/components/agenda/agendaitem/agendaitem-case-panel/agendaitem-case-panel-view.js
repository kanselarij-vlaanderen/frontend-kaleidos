import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { lastValue, task } from 'ember-concurrency';

export default class AgendaitemCasePanelView extends Component {
  @lastValue('loadCase') case;
  @tracked showLoader = false;

  constructor() {
    super(...arguments);
    this.loadCase.perform();
  }

  @task
  *loadCase() {
    if (this.args.subcase) {
      return yield this.args.subcase.case;
    }
    return null;
  }
}
