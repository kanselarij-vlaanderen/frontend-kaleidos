import SessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import ENV from 'frontend-kaleidos/config/environment';

export default class ExtendedSessionService extends SessionService {
  @service currentSession;

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
    if (logoutUrl.startsWith('http')) {
      super.handleInvalidation(logoutUrl);
    } else {
      super.handleInvalidation('aanmelden');
    }
  }
}
