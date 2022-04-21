import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  lastValue, task
} from 'ember-concurrency';

export default class AgendaitemCasePanelView extends Component {
  @service currentSession;

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
