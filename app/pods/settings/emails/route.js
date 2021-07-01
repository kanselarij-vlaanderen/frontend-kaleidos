import Route from '@ember/routing/route';

export default class EmailsRoute extends Route {
  model() {
    return this.store.queryOne('email-notification-setting');
  }
}
