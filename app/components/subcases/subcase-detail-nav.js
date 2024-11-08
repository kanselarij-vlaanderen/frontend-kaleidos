import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class subcaseDetailNav extends Component {
  @service intl;

  get items() {
    return [
      { elementId: 'case', label: this.intl.t('overview') },
      { elementId: 'documents', label: this.intl.t('documents') },
      { elementId: 'agenda', label: this.intl.t('agenda-activities') },
    ];
  }
}
