import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

export default class ThemisPublicationsPublishConfirmationModalComponent extends Component {
  @service intl;

  get confirmationMessage() {
    if (this.args.scope.includes(CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS)) {
      return this.intl.t('confirm-publication-scope-newsitems-and-documents');
    } else {
      return this.intl.t('confirm-publication-scope-newsitems-only');
    }
  }

  @task
  *confirmPublish() {
    yield this.args.onConfirm(this.args.scope);
  }
}
