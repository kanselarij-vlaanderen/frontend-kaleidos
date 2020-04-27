import Route from '@ember/routing/route';

export default class SystemAlertsRoute extends Route {
  model() {
    return this.store.findAll('alert');
  }
}
