import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';

const EMAIL_ADDRESS_KEYS = [
  'translationRequestToEmail',
  'translationRequestCcEmail',
  'proofRequestToEmail',
  'proofRequestCcEmail',
  'publicationRequestToEmail',
  'publicationRequestCcEmail',
];

export default class SettingsEmailController extends Controller {
  @service router;
  @service store;

  @task
  *save() {
    for (let addressKey of EMAIL_ADDRESS_KEYS) {
      const address = this.model[addressKey];
      const cleanAddress = address?.trim() ? address : undefined;
      this.model[addressKey] = cleanAddress;
    }

    yield this.model.save();

    this.router.transitionTo('settings.overview');
  }

  @action
  cancel() {
    this.model.rollbackAttributes();
    this.router.transitionTo('settings.overview');
  }

  get isDisabled() {
    return (
      isBlank(this.model.translationRequestToEmail) ||
      isBlank(this.model.proofRequestToEmail) ||
      isBlank(this.model.publicationRequestToEmail)
    );
  }
}
