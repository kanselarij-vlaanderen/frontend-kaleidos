import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SubcasesPublicationSubcaseHeaderComponent extends Component {
  @service intl;

  get items() {
    return [
      { elementId: 'publication-case-info', label: this.intl.t('publication-case-info-panel-title') },
      { elementId: 'publication-decisions', label: this.intl.t('publication-decisions-info-panel-title') },
      { elementId: 'publication-statusses', label: this.intl.t('publication-statusses') },
    ];
  }
}
