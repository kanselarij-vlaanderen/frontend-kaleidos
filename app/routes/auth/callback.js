import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthCallbackRoute extends Route {
  @service session;
  @service router;

  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model(params) {
    console.debug(params);
    if (params?.code) {
      try {
        await this.session.authenticate('authenticator:acm-idm', params.code);
      } catch (error) {
        throw new Error(
          'Something went wrong while authenticating the user in the backend. The token might be expired.',
          { cause: error },
        );
      }
    } else {
      this.router.replaceWith('login');
    }
  }
}