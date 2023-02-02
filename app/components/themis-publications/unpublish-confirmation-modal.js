import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

export default class ThemisPublicationsUnpublishConfirmationModalComponent extends Component {
  @service intl;

  @tracked selectedOption;

  options = [
    {
      label: this.intl.t('publication-scope-newsitems-and-documents'),
      value: 'unpublish-all',
      scope: [],
    },
    {
      label: this.intl.t('publication-scope-documents-only'),
      value: 'unpublish-documents-only',
      scope: [CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS],
    },
  ];

  constructor() {
    super(...arguments);
    this.selectedOption = this.options[0];
  }

  @action
  selectOption(value) {
    this.selectedOption = this.options.find((option) => option.value == value);
  }

  @task
  *confirmUnpublish() {
    yield this.args.onConfirm(this.selectedOption.scope);
  }
}
