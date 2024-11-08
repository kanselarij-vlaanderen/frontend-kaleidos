import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class SubcasesParliamentSubcaseHeaderComponent extends Component {
  @service intl;

  get items() {
    return [
      { elementId: 'case-info', label: this.intl.t('case-info') },
      { elementId: 'documents', label: this.intl.t('newest-documents') },
      { elementId: 'document-versions', label: this.intl.t('document-versions') },
    ];
  }
}
