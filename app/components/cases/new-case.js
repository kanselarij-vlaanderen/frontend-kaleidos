import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';

/**
  * @argument didSave: action, passes down the newly created decisionmakingFlow
  * @argument onCancel: action
  */
export default class NewCase extends Component {
  @service store;

  @tracked shortTitle;

  get isCreateDisabled() {
    return (
      isBlank(this.shortTitle) ||
      this.createCase.isRunning
    );
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
}
