import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewCase extends Component {
  title = null;
  shortTitle = null;
  confidential = false;
  @service store;
  @tracked hasError = false;
  @tracked isLoading = false;

  async createCase() {
    const newDate = moment().utc()
      .toDate();
    const {
      title, shortTitle, confidential,
    } = this;
    const caze = this.store.createRecord('case',
      {
        title,
        shortTitle,
        confidential,
        isArchived: false,
        created: newDate,
      });
    await caze.save();
    this.isLoading = false;
    return this.args.close(caze);
  }

  get getClassForShortTitle() {
    if (this.hasError) {
      return 'auk-form-group--error';
    }
    return null;
  }

  @action
  async createCaseAction($event) {
    $event.preventDefault();
    const {
      shortTitle,
    } = this;
    if (shortTitle < 1) {
      this.hasError = true;
    } else {
      this.isLoading = true;
      await this.createCase();
    }
  }

  @action
  closeAction() {
    this.args.close();
  }
}
