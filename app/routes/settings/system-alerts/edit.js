import Route from '@ember/routing/route';

export default class EditSystemAlertsRoute extends Route {
  model(params) {
    return this.store.findRecord('alert', params.alert_id);
  }
}
