import Route from '@ember/routing/route';

export default class EmailsRoute extends Route {
  async model() {
    // TODO Query one krijgt undefined bij filter
    return this.store.queryOne('email-notification-setting', {});
  }
}
