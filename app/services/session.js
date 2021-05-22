import SessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';

export default class ExtendedSessionService extends SessionService {
  @service currentSession;
  @service router;

  async handleAuthentication() {
    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.invalidate();
    }
    super.handleAuthentication('agendas');
  }

  handleInvalidation() {
    const logoutUrl = ENV.torii.providers['acmidm-oauth2'].logoutUrl;
    try {
      const url = new URL(logoutUrl);
      window.location.replace(url.toString());
    } catch (error) { // eslint-disable-line no-unused-vars
      this.router.transitionTo('login');
    }
  }
}
