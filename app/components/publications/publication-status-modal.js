import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class PublicationStatusModal extends Component {
  @service store;

  @tracked publicationStatus;
  @tracked publicationStatusChange;

  constructor() {
    super(...arguments);
    this.publicationStatus = this.args.publicationStatus;
    this.publicationStatusChange = new Date();
  }

  get publicationStatusses() {
    return this.store.peekAll('publication-status').sortBy('position');
  }

  @action
  selectPublicationStatus(status) {
    this.publicationStatus = status;
  }

  @action
  setStatusDate(selectedDates) {
    this.publicationStatusChange = selectedDates[0];
  }

  @task
  *savePublicationStatus() {
    const saveInformation = {
      status: this.publicationStatus,
      changeDate: this.publicationStatusChange
    };
    yield this.args.onSave(saveInformation);
  }
}
