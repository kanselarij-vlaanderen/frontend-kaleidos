import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class EditSystemAlertsController extends Controller {
  @(task(function *(model) {
    yield model.save();
    this.transitionToRoute('settings.system-alerts');
    return model;
  })) save;

  @action
  cancel() {
    this.model.rollbackAttributes();
    this.transitionToRoute('settings.system-alerts');
  }
}
