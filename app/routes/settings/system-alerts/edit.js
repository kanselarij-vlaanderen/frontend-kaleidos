import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditSystemAlertsRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('alert', params.alert_id);
  }
}
