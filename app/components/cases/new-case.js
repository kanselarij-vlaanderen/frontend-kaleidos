import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';

/**
  * @argument didSave: action, passes down the newly created decisionmakingFlow
  * @argument onCancel: action
  */
export default class NewCase extends Component {
  @service store;

  shortTitle = null;
  @tracked hasError = false;

  get isLoading() {
    return this.createCase.isRunning;
  }

  @task
  *createCase() {
    const now = new Date();
    const _case = this.store.createRecord('case', {
      shortTitle: this.shortTitle,
      isArchived: false,
      created: now,
    });
    yield _case.save();
    const decisionmakingFlow = this.store.createRecord('decisionmaking-flow', {
      case: _case,
      opened: now,
    });
    yield decisionmakingFlow.save();
    return this.args.didSave(decisionmakingFlow);
  }

  @action
  async validateAndCreateCase() {
    if (isBlank(this.shortTitle)) {
      this.hasError = true;
    } else {
      await this.createCase.perform();
    }
  }
}
