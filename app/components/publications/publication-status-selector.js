import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationStatusSelector extends Component {
  @service store;
  @tracked publicationStatusses

  constructor() {
    super(...arguments);
    this.publicationStatusses = this.store.peekAll('publication-status').sortBy('position');
  }

  @action
  setPublicationStatus(event) {
    const publicationStatus = this.store.peekRecord('publication-status', event.id);
    this.args.onChange(publicationStatus);
  }
}
