import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class NewCase extends Component {
  @service store;

  @tracked shortTitle = null;
  @tracked confidential = false;
  @tracked hasError = false;

  @task
  *createNewCaseTask() {
    const {
      shortTitle,
      confidential,
    } = this;
    if (shortTitle === null || shortTitle.trim().length === 0) {
      this.hasError = true;
    } else {
      const _case = this.store.createRecord('case',
        {
          shortTitle,
          confidential,
          isArchived: false,
          created: new Date(),
        });
      yield _case.save();
      this.args.onSave(_case);
    }
  }
}
