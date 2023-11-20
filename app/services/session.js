import SessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';

export default class ExtendedSessionService extends SessionService {
  @service currentSession;
  @service router;

  get unauthenticatedRouteName() {
    if (ENV.environment === 'development') {
      return 'mock-login';
    } else {
      return 'login';
    }
  }

  async handleAuthentication() {
    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.invalidate();
    }
    super.handleAuthentication('index');
  }

  async handleInvalidation() {
    await this.currentSession.clear();
    const logoutUrl = ENV.torii.providers['acmidm-oauth2'].logoutUrl;
    try {
      const url = new URL(logoutUrl);
      window.location.replace(url.toString());
    } catch (error) { // eslint-disable-line no-unused-vars
      this.router.transitionTo(this.unauthenticatedRouteName);
    }
  }

  async invalidate() {
    await this.currentSession.clear();
    return super.invalidate(...arguments);
  }
}
