import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationStatusSelector extends Component {
  @service store;

  @tracked publicationStatusses
  @tracked statusOptions = [];

  constructor() {
    super(...arguments);
    this.publicationStatusses = this.store.peekAll('publication-status').sortBy('position');
    this.fillStatusOptions();
  }

  fillStatusOptions() {
    for (const publicationStatus of this.publicationStatusses) {
      let icon;
      if (publicationStatus.isPending) {
        icon =  {
          svg: 'clock',
          color: 'warning',
        };
      } else if (publicationStatus.isPublished) {
        icon =   {
          svg: 'circle-check',
          color: 'success',
        };
      } else if (publicationStatus.isPaused) {
        icon =  {
          svg: 'circle-pause',
          color: 'muted',
        };
      } else if (publicationStatus.isWithdrawn) {
        icon =   {
          svg: 'circle-error',
          color: 'danger',
        };
      } else {
        icon =  {
          color: 'muted',
        };
      }
      const option = {
        id: publicationStatus.id,
        label: publicationStatus.label,
        icon: icon,
      };
      this.statusOptions.push(option);
    }
  }
  get getPublicationStatus() {
    return this.statusOptions.find(
      (statusOption) => statusOption.id === this.args.publicationStatus.id);
  }

  @action
  setPublicationStatus(event) {
    const publicationStatus = this.store.peekRecord('publication-status', event.id);
    this.args.onChange(publicationStatus);
  }
}
