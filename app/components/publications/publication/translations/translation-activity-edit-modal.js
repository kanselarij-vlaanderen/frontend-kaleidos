import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default class PublicationsPublicationTranslationsTranslationActivityEditModal extends Component {
  @tracked receivedDate;

  constructor() {
    super(...arguments);
    this.receivedDate = this.args.receivedDate;
  }

  get isSaveDisabled() {
    return isEmpty(this.receivedDate) || this.save.isRunning;
  }

  @action
  setReceivedDate(selectedDates) {
    if (selectedDates.length) {
      this.receivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.receivedDate = undefined;
    }
  }

  @task
  *save() {
    yield this.args.onSave({
      receivedDate: this.receivedDate
    });
  }
}
