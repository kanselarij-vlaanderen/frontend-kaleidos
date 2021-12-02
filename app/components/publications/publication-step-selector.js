import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PublicationStepSelector extends Component {
  @service store;
  @tracked publicationStatusses;

  constructor() {
    super(...arguments);
    this.publicationStatusses = this.store.peekAll('publication-status').sortBy('position');
  }
}
