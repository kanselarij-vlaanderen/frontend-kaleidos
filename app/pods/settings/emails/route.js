import Route from '@ember/routing/route';

export default class EmailsRoute extends Route {
  async model() {
    return this.store
      .queryOne('email-notification-setting', {
        'page[size]': 1,
      });
  }
}
