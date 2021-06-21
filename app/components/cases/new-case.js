import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewCase extends Component {
  @service store;

  @tracked shortTitle = null;
  @tracked confidential = false;
  @tracked hasError = false;
  @tracked isLoading = false;

  async createCase() {
    const newDate = new Date();
    const {
      shortTitle, confidential,
    } = this;
    const _case = this.store.createRecord('case',
      {
        shortTitle,
        confidential,
        isArchived: false,
        created: newDate,
      });
    await _case.save();
    this.isLoading = false;
    return this.args.onSave(_case);
  }

  @action
  async createCaseAction($event) {
    $event.preventDefault();
    const {
      shortTitle,
    } = this;
    if (shortTitle === null || shortTitle.trim().length === 0) {
      this.hasError = true;
    } else {
      this.isLoading = true;
      await this.createCase();
    }
  }
}
