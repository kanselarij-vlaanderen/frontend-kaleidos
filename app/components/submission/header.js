import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SubmissionHeaderComponent extends Component {
  @service intl;

  get items() {
    return [
      { elementId: 'submission', label: this.intl.t('overview') },
      { elementId: 'documents', label: this.intl.t('documents') },
      { elementId: 'agenda', label: this.intl.t('agenda-activities') },
    ];
  }
}
