import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class PublicationStatusModal extends Component {
  @service store;

  @tracked publicationStatus;

  constructor() {
    super(...arguments);
    this.publicationStatus = this.args.publicationStatus;
  }

  get publicationStatusses() {
    return this.store.peekAll('publication-status')
      .slice()
      .sort((s1, s2) => s1.position - s2.position);
  }

  get isDisabledSave() {
    return (
      this.publicationStatus == this.args.publicationStatus || // no new status selected
      this.savePublicationStatus.isRunning
    );
  }

  @action
  selectPublicationStatus(status) {
    this.publicationStatus = status;
  }

  @task
  *savePublicationStatus() {
    yield this.args.onSave(this.publicationStatus, new Date());
  }
}
