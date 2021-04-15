import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
export default class PublicationStatusSelector extends Component {
  @service store;
  @tracked showConfirmWithdraw = false;

  statusOptions = [{
    id: CONFIG.PUBLICATION_STATUSES.pending.id,
    label: 'Te publiceren',
    icon: {
      svg: 'clock',
      color: 'warning',
    },
  }, {
    id: CONFIG.PUBLICATION_STATUSES.published.id,
    label: 'Gepubliceerd',
    icon: {
      svg: 'circle-check',
      color: 'success',
    },
  }, {
    id: CONFIG.PUBLICATION_STATUSES.paused.id,
    label: 'Gepauzeerd',
    icon: {
      svg: 'circle-pause',
      color: 'muted',
    },
  }, {
    id: CONFIG.PUBLICATION_STATUSES.withdrawn.id,
    label: 'Afgevoerd',
    icon: {
      svg: 'circle-error',
      color: 'danger',
    },
  }];

  get getPublicationStatus() {
    return this.statusOptions.find((statusOption) => statusOption.id === this.model.publicationFlow.get('status.id'));
  }


  @action
  async setPublicationStatus(event) {
    if (event.id === CONFIG.PUBLICATION_STATUSES.withdrawn.id) {
      // Show popup and do nothing.
      this.showConfirmWithdraw = true;
    } else {
      const publicationStatus = await this.store.findRecord('publication-status', event.id);
      this.model.publicationFlow.set('status', publicationStatus);
      this.model.publicationFlow.save();
    }
  }
}
