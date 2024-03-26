import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SubcasesParliamentSubcaseHeaderComponent extends Component {
  @service intl;

  get items() {
    return [
      { elementId: 'case', label: this.intl.t('case-info') },
      { elementId: 'documents', label: this.intl.t('newest-documents') },
      { elementId: 'agenda', label: this.intl.t('document-versions') },
    ];
  }
}
