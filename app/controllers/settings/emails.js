import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency';

export default class SettingsEmailController extends Controller {
  @service router;

  @task
  *save() {
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
