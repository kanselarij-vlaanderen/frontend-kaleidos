import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class PublicationStatusModal extends Component {
  @service store;
  @tracked publicationStatusses;

  @tracked publicationStatus;
  @tracked publicationStatusChange;


  constructor() {
    super(...arguments);
    this.publicationStatusses = this.store.peekAll('publication-status').sortBy('position');
    this.publicationStatus = this.args.publicationStatus;
    this.publicationStatusChange = this.args.publicationStatusChange.startedAt;
  }

  @action
  selectPublicationStatus(status) {
    this.publicationStatus = status;
    this.publicationStatusChange = new Date();
  }

  @action
  setStatusDate(selectedDates) {
    this.publicationStatusChange  = selectedDates[0];
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
