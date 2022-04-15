import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class EditSystemAlertsController extends Controller {
  @service router;

  @task
  *save(model) {
    yield model.save();
    this.router.transitionTo('settings.system-alerts');
    return model;
  };

  @action
  cancel() {
    this.model.rollbackAttributes();
    this.router.transitionTo('settings.system-alerts');
  }
}
