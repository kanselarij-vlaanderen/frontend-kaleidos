import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CallbackRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model(params) {
    console.debug(params);
    this.session.authenticate('authenticator:acm-idm', params.code);
  }
}
