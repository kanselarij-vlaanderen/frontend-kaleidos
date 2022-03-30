import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class SystemAlertsController extends Controller {
  @tracked selectedAlert = null;

  @action
  selectAlert(alert) {
    this.selectedAlert = alert;
  }

  @task
  *remove(model) {
    yield model.destroyRecord();
    this.selectedAlert = null;
    return model;
  }

  @action
  cancel() {
    this.transitionToRoute('settings.overview');
  }
}
