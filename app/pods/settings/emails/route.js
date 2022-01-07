import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EmailsRoute extends Route {
  @service store;

  model() {
    return this.store.queryOne('email-notification-setting');
  }
}
