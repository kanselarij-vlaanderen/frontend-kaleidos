import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthCallbackRoute extends Route {
  @service session;
  @service router;
  @service toaster;
  @service intl;

  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model(params) {
    if (params?.code) {
      try {
        await this.session.authenticate('authenticator:acm-idm', params.code);
      } catch (error) {
        const message = error?.message ? error.message : `${error.status} ${error.statusText}`;
        this.toaster.error(
          this.intl.t('error-login', { message }),
          this.intl.t('warning-title'),
        );
      }
    } else {
      this.router.replaceWith('login');
    }
  }
}