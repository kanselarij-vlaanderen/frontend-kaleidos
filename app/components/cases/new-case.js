import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
/**
  * @argument didSave: action, passes down the newly created decisionmakingFlow
  * @argument onCancel: action
  */
export default class NewCase extends Component {
  @service store;

  shortTitle = null;
  @tracked hasError = false;

  @task
  *createCase() {
    const newDate = moment().utc().toDate();
    const { shortTitle } = this;
    const _case = this.store.createRecord('case', {
      shortTitle,
      isArchived: false,
      created: newDate,
    });
    yield _case.save();
    const decisionmakingFlow = this.store.createRecord('decisionmaking-flow', {
      case: _case,
      opened: newDate,
    });
    yield decisionmakingFlow.save();
    return this.args.didSave(decisionmakingFlow);
  }

  get isLoading() {
    return this.createCase.isRunning;
  }

  @action
  async validateAndCreateCase() {
    const { shortTitle } = this;
    if (shortTitle === null || shortTitle.trim().length === 0) {
      this.hasError = true;
    } else {
      await this.createCase.perform();
    }
  }
}
