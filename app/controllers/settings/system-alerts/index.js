import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';

export default class SystemAlertsController extends Controller {
  @service router;

  @tracked selectedAlert = null;

  @action
  selectAlert(alert) {
    this.selectedAlert = alert;
  }

  remove = task(async (model) => {
    await model.destroyRecord();
    this.selectedAlert = null;
    return model;
  });

  @action
  cancel() {
    this.router.transitionTo('settings');
  }
}
