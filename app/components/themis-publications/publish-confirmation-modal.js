import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class ThemisPublicationsPublishConfirmationModalComponent extends Component {
  @service intl;

  @tracked selectedOption;

  options = [
    {
      label: this.intl.t('publication-scope-newsitems-only'),
      value: 'publish-newsitems-only',
      scope: [CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS],
    },
    {
      label: this.intl.t('publication-scope-newsitems-and-documents'),
      value: 'publish-all',
      scope: [
        CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS,
        CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS
      ],
    },
  ];

  constructor() {
    super(...arguments);
    this.selectedOption = this.options[0];
  }

  @action
  selectOption(event) {
    const value = event.target.value;
    this.selectedOption = this.options.find((option) => option.value == value);
  }

  @task
  *confirmPublish() {
    yield this.args.onConfirm(this.selectedOption.scope);
  }
}
